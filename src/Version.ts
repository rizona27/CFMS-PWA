// src/Version.ts
export interface VersionInfo {
  version: string;
  displayName: string;
  updateDate: string;
  description: string;
}

export interface VersionConfig {
  currentVersion: string;
  author: string;
  year: string;
  copyright: string;
  updateLogs: VersionInfo[];
}

// 版本配置数据 - 按时间顺序排列，越新的越在后面
export const versionConfig: VersionConfig = {
  currentVersion: '3.1.6',
  author: 'rizona',
  year: '2025',
  copyright: 'CFMS v3.1.6 © 2025 rizona',
  updateLogs: [
    {
      version: 'Version 1.0.0',
      displayName: 'Version 1.0.0',
      updateDate: '2025-07-01',
      description: '初代MMP项目构建。'
    },
    {
      version: 'Version 2.0.0',
      displayName: 'Version 2.0.0',
      updateDate: '2025-08-11',
      description: '项目重构CFMS。\n重做UI界面。'
    },
    {
      version: 'Version 3.0.0',
      displayName: 'Version 3.0.0',
      updateDate: '2025-12-05',
      description: '在CFMS基础上构建PWA版本。\n支持多端同步。'
    },
    {
      version: 'Version 3.1.0',
      displayName: 'Version 3.1.0',
      updateDate: '2025-12-17',
      description: '重新构建Login登录校验前后端。\nAbout页面卡片统一样式。\n密码重置系统及后端构建。\n排名页优化。'
    }
  ]
};

// 按时间排序的更新日志（用于展示）
export const getSortedUpdateLogs = (): VersionInfo[] => {
  return [...versionConfig.updateLogs].sort((a, b) =>
    new Date(a.updateDate).getTime() - new Date(b.updateDate).getTime()
  );
};

// 获取当前版本信息
export const getCurrentVersion = (): string => versionConfig.currentVersion;

// 获取版权信息
export const getCopyright = (): string => versionConfig.copyright;

// 获取作者信息
export const getAuthor = (): string => versionConfig.author;

// 获取年份信息
export const getYear = (): string => versionConfig.year;
