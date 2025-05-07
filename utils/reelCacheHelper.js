import * as FileSystem from 'expo-file-system';

const videoCacheDir = `${FileSystem.cacheDirectory}reelVideos/`;
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const ensureCacheDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(videoCacheDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(videoCacheDir, { intermediates: true });
  }
};

const getSafeFileName = (url) => {
  return encodeURIComponent(url).replace(/[^\w\-\.]/g, '_');
};

const getCachedFilePath = (videoUrl) => {
  const fileName = getSafeFileName(videoUrl);
  return `${videoCacheDir}${fileName}`;
};

const isVideoCached = async (videoUrl) => {
  try {
    const filePath = getCachedFilePath(videoUrl);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      const now = Date.now();
      const fileTimestamp = fileInfo.modificationTime ?? 0;
      if (now - fileTimestamp > MAX_CACHE_AGE) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
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

export const cacheVideoIfNeeded = async (videoUrl, authToken) => {
  try {
    await ensureCacheDirExists();
    const localPath = getCachedFilePath(videoUrl);
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists && fileInfo.size > 100000) {
      return localPath;
    }

    const downloadResumable = FileSystem.createDownloadResumable(videoUrl, localPath, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'video/*',
      },
    });

    const result = await downloadResumable.downloadAsync();
    const downloadedInfo = await FileSystem.getInfoAsync(result.uri);
    console.log("downloadedInfo.size", downloadedInfo.size);
    if (!downloadedInfo.exists || downloadedInfo.size < 100) {
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
      throw new Error('Downloaded file is incomplete');
    }

    return result.uri;
  } catch (error) {
    console.warn(`⚠️ Video caching failed for: ${videoUrl}`, error.message);
    return videoUrl; // fallback
  }
};

export const cacheMultipleVideos = async (videoUrls, authToken) => {
  const cacheMap = {};
  for (const url of videoUrls) {
    const cached = await cacheVideoIfNeeded(url, authToken);
    cacheMap[url] = cached;
  }
  return cacheMap;
};
