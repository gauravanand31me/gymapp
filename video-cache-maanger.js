import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { useRef } from 'react';

const CACHE_FOLDER = `${FileSystem.cacheDirectory}video-cache/`;
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const ensureCacheDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });
  }
};

const getCacheKey = async (url) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    url
  );
  return hash;
};

const getCachedFilePath = async (url) => {
  const key = await getCacheKey(url);
  return `${CACHE_FOLDER}${key}`;
};

const isVideoCached = async (url) => {
  try {
    const filePath = await getCachedFilePath(url);
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      const now = new Date().getTime();
      const fileTimestamp = fileInfo.modificationTime ?? 0;

      if (now - fileTimestamp > MAX_CACHE_AGE) {
        await FileSystem.deleteAsync(filePath);
        return false;
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
};

const cacheVideo = async (url, headers) => {
  try {
    await ensureCacheDirectory();

    const filePath = await getCachedFilePath(url);
    const fileExists = await isVideoCached(url);

    if (!fileExists) {
      await FileSystem.downloadAsync(url, filePath, { headers });
      cleanCache();
    }

    return filePath;
  } catch (error) {
    console.error('Error caching video:', error);
    return url;
  }
};

const getVideoSource = async (url, headers) => {
  try {
    const isCached = await isVideoCached(url);

    if (isCached) {
      const filePath = await getCachedFilePath(url);
      return { uri: filePath };
    } else {
      cacheVideo(url, headers).catch(console.error);
      return { uri: url, headers };
    }
  } catch (error) {
    console.error('Error getting video source:', error);
    return { uri: url, headers };
  }
};

const cleanCache = async () => {
  try {
    const cacheDir = await FileSystem.readDirectoryAsync(CACHE_FOLDER);

    const fileInfoPromises = cacheDir.map(async (fileName) => {
      const filePath = `${CACHE_FOLDER}${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath, { size: true });

      return {
        path: filePath,
        ...fileInfo,
        size: fileInfo.exists ? fileInfo.size : 0,
        modificationTime: fileInfo.exists && 'modificationTime' in fileInfo ? fileInfo.modificationTime : 0
      };
    });

    const fileInfos = await Promise.all(fileInfoPromises);

    const totalSize = fileInfos.reduce((sum, file) => sum + (file.size || 0), 0);

    if (totalSize > MAX_CACHE_SIZE) {
      fileInfos.sort((a, b) => (a.modificationTime || 0) - (b.modificationTime || 0));

      let currentSize = totalSize;
      for (const file of fileInfos) {
        if (currentSize <= MAX_CACHE_SIZE * 0.8) break;

        await FileSystem.deleteAsync(file.path);
        currentSize -= file.size || 0;
      }
    }

    const now = new Date().getTime();
    for (const file of fileInfos) {
      const fileAge = now - (file.modificationTime || 0);
      if (fileAge > MAX_CACHE_AGE) {
        await FileSystem.deleteAsync(file.path);
      }
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
};

const preloadVideo = async (url, headers, bufferDuration = 5000) => {
  try {
    const cachedPath = await cacheVideo(url, headers);

    const videoRef = new Video(null);

    await videoRef.loadAsync(
      { uri: cachedPath },
      { shouldPlay: false, isMuted: true }
    );

    await videoRef.playAsync();

    return new Promise((resolve) => {
      setTimeout(async () => {
        await videoRef.pauseAsync();
        await videoRef.setPositionAsync(0);
        resolve(videoRef);
      }, bufferDuration);
    });
  } catch (error) {
    console.error('Error preloading video:', error);
    return null;
  }
};

const clearCache = async () => {
  try {
    await FileSystem.deleteAsync(CACHE_FOLDER, { idempotent: true });
    await ensureCacheDirectory();
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

const useVideoPreloader = () => {
  const videoRefs = useRef({});

  const preloadVideoToMemory = async (url, headers) => {
    try {
      const source = await getVideoSource(url, headers);

      if (!videoRefs.current[url]) {
        videoRefs.current[url] = new Video(null);
      }

      const videoRef = videoRefs.current[url];

      await videoRef.loadAsync(source, { shouldPlay: false, isMuted: true });

      await videoRef.playAsync();

      setTimeout(async () => {
        if (videoRef) {
          try {
            await videoRef.pauseAsync();
            await videoRef.setPositionAsync(0);
          } catch (e) {}
        }
      }, 3000);

      return url;
    } catch (error) {
      console.error('Error preloading video to memory:', error);
      return null;
    }
  };

  const releaseVideo = (url) => {
    if (videoRefs.current[url]) {
      try {
        videoRefs.current[url].unloadAsync();
      } catch (e) {}
      delete videoRefs.current[url];
    }
  };

  const releaseAllVideos = () => {
    Object.keys(videoRefs.current).forEach(releaseVideo);
  };

  return {
    preloadVideoToMemory,
    releaseVideo,
    releaseAllVideos
  };
};

export default {
  cacheVideo,
  getVideoSource,
  isVideoCached,
  preloadVideo,
  clearCache,
  cleanCache,
  useVideoPreloader
};
