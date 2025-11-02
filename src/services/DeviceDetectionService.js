/**
 * 设备检测服务
 * 用于识别用户设备类型、方向和交互模式，为跨平台适配提供支持
 */
class DeviceDetectionService {
  constructor() {
    this.updateDeviceInfo();
    this.setupEventListeners();
  }

  /**
   * 更新设备信息并设置CSS变量
   */
  updateDeviceInfo() {
    // 重置所有平台标识
    document.documentElement.style.setProperty('--platform-pc', 'false');
    document.documentElement.style.setProperty('--platform-mobile', 'false');
    document.documentElement.style.setProperty('--platform-console', 'false');

    // 检测设备类型
    const isMobile = this.isMobileDevice();
    const isConsole = this.isConsole();
    const isPC = !isMobile && !isConsole;

    // 设置平台标识
    document.documentElement.style.setProperty('--platform-pc', isPC ? 'true' : 'false');
    document.documentElement.style.setProperty('--platform-mobile', isMobile ? 'true' : 'false');
    document.documentElement.style.setProperty('--platform-console', isConsole ? 'true' : 'false');

    // 检测设备方向
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    document.documentElement.style.setProperty('--device-orientation', orientation);

    // 检测交互模式
    const interactionMode = window.matchMedia('(pointer: fine)').matches ? 'pointer' : 'touch';
    document.documentElement.style.setProperty('--interaction-mode', interactionMode);

    console.log('设备信息更新:', {
      isPC,
      isMobile,
      isConsole,
      orientation,
      interactionMode
    });
  }

  /**
   * 检测是否为移动设备
   */
  isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // 检测常见移动设备
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return mobileRegex.test(userAgent);
  }

  /**
   * 检测是否为主机平台
   */
  isConsole() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // 检测主机平台特征
    const consoleFeatures = [
      'playstation',
      'xbox',
      'nintendo'
    ];

    return consoleFeatures.some(feature => userAgent.includes(feature));
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.debounce(() => {
      this.updateDeviceInfo();
    }, 250));

    // 监听设备方向变化
    window.addEventListener('orientationchange', () => {
      this.updateDeviceInfo();
    });

    // 监听指针类型变化
    const pointerMediaQuery = window.matchMedia('(pointer: fine)');
    pointerMediaQuery.addEventListener('change', () => {
      this.updateDeviceInfo();
    });
  }

  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 获取当前平台类型
   */
  getCurrentPlatform() {
    if (document.documentElement.style.getPropertyValue('--platform-pc') === 'true') {
      return 'pc';
    } else if (document.documentElement.style.getPropertyValue('--platform-mobile') === 'true') {
      return 'mobile';
    } else if (document.documentElement.style.getPropertyValue('--platform-console') === 'true') {
      return 'console';
    }
    return 'unknown';
  }

  /**
   * 获取当前设备方向
   */
  getCurrentOrientation() {
    return document.documentElement.style.getPropertyValue('--device-orientation');
  }

  /**
   * 获取当前交互模式
   */
  getInteractionMode() {
    return document.documentElement.style.getPropertyValue('--interaction-mode');
  }
}

// 创建单例实例
const deviceDetectionService = new DeviceDetectionService();

export default deviceDetectionService;