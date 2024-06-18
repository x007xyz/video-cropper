import { MP4Clip } from "@webav/av-cliper"

export default function sum(a: number, b: number) {
  return a + b;
}

/**
 * Retrieves the thumbnails of a video given its URL.
 * 参考张鑫旭博客：https://www.zhangxinxu.com/study/202401/js-get-mp4-video-image-demo.php
 * @param url - The URL of the video.
 * @returns A promise that resolves to an array of thumbnail URLs.
 */
export const getVideoThumbs = async (url: string): Promise<string[]> => {
  return new Promise((resolve) => {
    // 基于视频元素绘制缩略图，而非解码视频
    const video = document.createElement('video');
    // 静音
    video.muted = true;
  
    // 绘制缩略图的canvas画布元素
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', {
      willReadFrequently: true
    });
  
    // 绘制缩略图的标志量
    let isTimeUpdated = false;
    // 几个视频事件
    // 1. 获取视频尺寸
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      // 开始执行绘制
      draw();
    });
    // 2. 触发绘制监控
    video.addEventListener('timeupdate', () => {
      isTimeUpdated = true;
    });
  
    // 请求视频地址，如果是本地文件，直接执行
    if (/^blob:|base64,/i.test(url)) {
      video.src = url;
    } else {
      fetch(url).then(res => res.blob()).then(blob => {
        // 赋予视频
        video.src = URL.createObjectURL(blob);
      });
    }
  
    // 绘制方法
    const draw = () => {
      const arrThumb: string[] = [];
      const duration = video.duration;
      let seekTime = 0.1;
  
      const loop = () => {
        if (isTimeUpdated && context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
          canvas.toBlob(blob => {
            if (blob) {
              arrThumb.push(URL.createObjectURL(blob));
            }
  
            seekTime += 1;
  
            if (seekTime > duration) {
              // 执行完毕
              resolve(arrThumb)
              return;
            }
  
            step();
          }, 'image/jpeg');
  
          return;
        }
        // 监控状态
        requestAnimationFrame(loop);
      }
  
      // 逐步绘制，因为currentTime修改生效是异步的
      const step = () => {
        isTimeUpdated = false;
        video.currentTime = seekTime;
  
        loop();
      }
  
      step();
    }
  });
}

/**
 * 绘制视频缩略图
 * 参数：
 * 1. 视频流
 * 2. 缩略图尺寸、缩略图数量
 * 3. 时间轴（缩略图列表）的尺寸
 * 第2、3项，选择其中一项即可
 * 拆分为两个方法，一个是获取视频缩略图，返回一个缩略图列表，一个是绘制视频缩略图时间轴，返回绘制好的时间轴
 */

export const getThumbnailList = async (source: ReadableStream<Uint8Array>, width: number, step: number): Promise<Blob[]> => {

  const clip = new MP4Clip(source);

  await clip.ready;

  const thumbnails = await clip.thumbnails(width, { step })

  return thumbnails.map((item) => item.img)
}

export const drawThumbnailsImage = async (source: ReadableStream<Uint8Array>, container: { width: number, height: number }): Promise<{ duration: number, width: number, height: number, bitmap: ImageBitmap }> => {

  const clip = new MP4Clip(source);

  await clip.ready;

  const { duration, width, height } = clip.meta;

  const imgWidth = container.height * width / height;

  // 计算step
  const step = duration / Math.ceil(container.width / imgWidth);

  const offscreenCanvas = new OffscreenCanvas(container.width, container.height);

  const ctx = offscreenCanvas.getContext('2d');

  let cur = 0;

  while (cur <= duration) {
    const vf = await clip.tick(cur);
    if (vf && vf.video) {
      // 绘制到同一个canvas上
      ctx?.drawImage(vf.video, cur / step * imgWidth, 0, imgWidth, container.height)
    }
    cur += step;
  }

  return { duration, width, height, bitmap: offscreenCanvas.transferToImageBitmap()}
}