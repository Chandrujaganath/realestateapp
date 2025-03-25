/// <reference types="node" />

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(_date: Date | string): string {
  const _d = new Date(_date);
  return _d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(_amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(_amount);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function isValidEmail(_email: string): boolean {
  const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return _emailRegex.test(_email);
}

export function isValidPhone(_phone: string): boolean {
  const _phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return _phoneRegex.test(_phone);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  _wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>): void {
    const _later = (): void => {
      clearTimeout(timeout);
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(_later, _wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  _limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), _limit);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((_n) => _n[0])
    .join('')
    .toUpperCase();
}

export function calculateProgress(_current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((_current / total) * 100);
}

export function formatFileSize(bytes: number): string {
  const k = 1024;
  const _sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + _sizes[i];
}

export function getRandomColor(): string {
  const _letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += _letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function sleep(_ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, _ms));
}

export function isObjectEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function getQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

export function setQueryParams(params: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  const searchParams = new URLSearchParams(params);
  window.history.replaceState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
}

export function removeQueryParams(): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, '', window.location.pathname);
}

export function scrollToTop(): void {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return navigator.clipboard.writeText(text);
}

export function getBrowserInfo(): {
  name: string;
  version: string;
  platform: string;
} {
  if (typeof window === 'undefined') {
    return { name: 'Unknown', version: 'Unknown', platform: 'Unknown' };
  }

  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let platform = 'Unknown';

  if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari/')) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edge/')) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  }

  if (ua.includes('Windows')) {
    platform = 'Windows';
  } else if (ua.includes('Mac')) {
    platform = 'Mac';
  } else if (ua.includes('Linux')) {
    platform = 'Linux';
  } else if (ua.includes('Android')) {
    platform = 'Android';
  } else if (ua.includes('iOS')) {
    platform = 'iOS';
  }

  return { name: browserName, version: browserVersion, platform };
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Handle error silently
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Handle error silently
  }
}

export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.clear();
  } catch {
    // Handle error silently
  }
}

export function getSessionStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setSessionStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Handle error silently
  }
}

export function removeSessionStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Handle error silently
  }
}

export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.clear();
  } catch {
    // Handle error silently
  }
}

export function formatNumber(_num: number): string {
  return new Intl.NumberFormat('en-IN').format(_num);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

export function isValidFileType(file: File, _allowedTypes: string[]): boolean {
  return _allowedTypes.includes(file.type);
}

export function isValidFileSize(file: File, _maxSize: number): boolean {
  return file.size <= _maxSize;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function generateUniqueFilename(_originalFilename: string): string {
  const ext = getFileExtension(_originalFilename);
  const _timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${_timestamp}-${random}.${ext}`;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getUrlParams(url: string): Record<string, string> {
  try {
    const { searchParams } = new URL(url);
    return Object.fromEntries(searchParams.entries());
  } catch {
    return {};
  }
}

export function buildUrl(_baseUrl: string, params: Record<string, string>): string {
  const url = new URL(_baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

export function parseQueryString(_queryString: string): Record<string, string> {
  const params = new URLSearchParams(_queryString);
  return Object.fromEntries(params.entries());
}

export function buildQueryString(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

export function getBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

export function getCurrentPath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

export function getFullUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

export function redirectTo(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.href = url;
}

export function reloadPage(): void {
  if (typeof window === 'undefined') return;
  window.location.reload();
}

export function goBack(): void {
  if (typeof window === 'undefined') return;
  window.history.back();
}

export function goForward(): void {
  if (typeof window === 'undefined') return;
  window.history.forward();
}

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return window.navigator.onLine;
}

export function isOffline(): boolean {
  return !isOnline();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNetworkInfo(): {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
} {
  if (typeof window === 'undefined') {
    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connection =
    (navigator as any).connection ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).mozConnection ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).webkitConnection;

  return {
    type: connection?.type || 'unknown',
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
  };
}

export function getBatteryInfo(): Promise<{
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}> {
  if (typeof window === 'undefined') {
    return Promise.resolve({
      level: 0,
      charging: false,
      chargingTime: 0,
      dischargingTime: 0,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (navigator as any).getBattery().then((battery: any) => ({
    level: battery.level,
    charging: battery.charging,
    chargingTime: battery.chargingTime,
    dischargingTime: battery.dischargingTime,
  }));
}

export function getDeviceMemory(): number {
  if (typeof window === 'undefined') return 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (navigator as any).deviceMemory || 0;
}

export function getHardwareConcurrency(): number {
  if (typeof window === 'undefined') return 0;
  return navigator.hardwareConcurrency || 0;
}

export function getScreenInfo(): {
  width: number;
  height: number;
  pixelRatio: number;
  colorDepth: number;
  orientation: string;
} {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      pixelRatio: 0,
      colorDepth: 0,
      orientation: 'unknown',
    };
  }

  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio,
    colorDepth: window.screen.colorDepth,
    orientation: window.screen.orientation?.type || 'unknown',
  };
}

export function getViewportInfo(): {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
} {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      scrollX: 0,
      scrollY: 0,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };
}

export function getElementInfo(element: HTMLElement): {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  x: number;
  y: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    x: rect.x,
    y: rect.y,
  };
}

export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

export function scrollElementIntoView(
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void {
  element.scrollIntoView({ behavior });
}

export function getElementScrollPosition(element: HTMLElement): {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
} {
  return {
    scrollTop: element.scrollTop,
    scrollLeft: element.scrollLeft,
    scrollHeight: element.scrollHeight,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
  };
}

export function isElementScrollable(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

export function getElementComputedStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

export function setElementStyle(element: HTMLElement, property: string, value: string): void {
  element.style.setProperty(property, value);
}

export function removeElementStyle(element: HTMLElement, property: string): void {
  element.style.removeProperty(property);
}

export function addElementClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

export function removeElementClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

export function toggleElementClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className);
}

export function hasElementClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

export function getElementAttributes(element: HTMLElement): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrs = element.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    attributes[attr.name] = attr.value;
  }
  return attributes;
}

export function setElementAttribute(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(name, value);
}

export function removeElementAttribute(element: HTMLElement, name: string): void {
  element.removeAttribute(name);
}

export function hasElementAttribute(element: HTMLElement, name: string): boolean {
  return element.hasAttribute(name);
}

export function getElementDataAttributes(element: HTMLElement): Record<string, string> {
  const dataAttributes: Record<string, string> = {};
  const attributes = element.attributes;
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.name.startsWith('data-')) {
      dataAttributes[attr.name.slice(5)] = attr.value;
    }
  }
  return dataAttributes;
}

export function setElementDataAttribute(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(`data-${name}`, value);
}

export function removeElementDataAttribute(element: HTMLElement, name: string): void {
  element.removeAttribute(`data-${name}`);
}

export function hasElementDataAttribute(element: HTMLElement, name: string): boolean {
  return element.hasAttribute(`data-${name}`);
}

export function getElementTextContent(element: HTMLElement): string {
  return element.textContent || '';
}

export function setElementTextContent(element: HTMLElement, text: string): void {
  element.textContent = text;
}

export function getElementInnerHTML(element: HTMLElement): string {
  return element.innerHTML;
}

export function setElementInnerHTML(element: HTMLElement, html: string): void {
  element.innerHTML = html;
}

export function getElementOuterHTML(element: HTMLElement): string {
  return element.outerHTML;
}

export function setElementOuterHTML(element: HTMLElement, html: string): void {
  const parent = element.parentNode;
  if (parent) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    parent.replaceChild(temp.firstChild as Node, element);
  }
}

export function getElementTagName(element: HTMLElement): string {
  return element.tagName.toLowerCase();
}

export function getElementClassList(element: HTMLElement): string[] {
  return Array.from(element.classList);
}
