import { useIntegration } from '@gitroom/frontend/components/launches/helpers/use.integration';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { textSlicer } from '@gitroom/helpers/utils/count.length';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { VideoOrImage } from '@gitroom/react/helpers/video.or.image';
import { SliderComponent } from '@gitroom/frontend/components/third-parties/slider.component';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { hasExtension } from '@gitroom/helpers/utils/has.extension';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

interface PreviewAudio {
  title?: string;
  artist?: string;
  image?: string;
  previewUrl?: string;
  audio_volume?: number;
  video_volume?: number;
}

const ReelIcon: FC<{ d: string; size?: number; fill?: string }> = ({
  d,
  size = 26,
  fill = 'none',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ReelAction: FC<{ d: string }> = ({ d }) => (
  <div className="flex flex-col items-center gap-[2px] text-[12px]">
    <ReelIcon d={d} />
    <div>0</div>
  </div>
);

const ReelFeedPreview: FC<{
  src: string;
  audio?: PreviewAudio;
  avatar: string;
  name: string;
  caption: string;
}> = ({ src, audio, avatar, name, caption }) => {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const music = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const hasSong = !!audio?.previewUrl;

  const stop = useCallback(() => {
    video.current?.pause();
    music.current?.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (video.current) {
      video.current.volume = hasSong ? (audio?.video_volume ?? 100) / 100 : 1;
    }
    if (music.current) {
      music.current.volume = (audio?.audio_volume ?? 100) / 100;
    }
  }, [hasSong, audio?.audio_volume, audio?.video_volume]);

  useEffect(() => stop, [src, audio?.previewUrl]);

  const toggle = useCallback(async () => {
    if (!video.current) {
      return;
    }
    if (playing) {
      stop();
      return;
    }
    video.current.currentTime = 0;
    if (music.current) {
      music.current.currentTime = 0;
    }
    try {
      await Promise.all([
        video.current.play(),
        ...(music.current ? [music.current.play()] : []),
      ]);
      setPlaying(true);
    } catch (err) {
      stop();
    }
  }, [playing, stop]);

  return (
    <div className="flex flex-col gap-[6px] w-full items-center">
      <div
        className="relative w-full max-w-[340px] aspect-[9/16] max-h-[640px] bg-black rounded-[24px] overflow-hidden text-white cursor-pointer"
        onClick={toggle}
      >
        <video
          ref={video}
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline={true}
          onEnded={() => {
            stop();
            setProgress(0);
          }}
          onTimeUpdate={(e) =>
            setProgress(
              e.currentTarget.duration
                ? e.currentTarget.currentTime / e.currentTarget.duration
                : 0
            )
          }
        />
        {hasSong && (
          <audio ref={music} src={audio?.previewUrl} onEnded={stop} />
        )}
        <div className="absolute inset-x-0 top-0 h-[90px] bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        <div className="absolute inset-x-0 top-[14px] px-[14px] flex items-center justify-between pointer-events-none">
          <ReelIcon d="M12 5v14M5 12h14" size={28} />
          <div className="flex items-center gap-[14px] text-[17px] font-[700]">
            <div className="flex items-center gap-[4px]">
              <span>Reels</span>
              <ReelIcon d="M6 9l6 6 6-6" size={14} />
            </div>
            <div className="opacity-60">Friends</div>
          </div>
          <ReelIcon d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" size={24} />
        </div>

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[56px] h-[56px] rounded-full bg-black/50 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        <div className="absolute right-[10px] bottom-[96px] flex flex-col items-center gap-[16px] pointer-events-none">
          <ReelAction d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
          <ReelAction d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6A8 8 0 1 1 21 12z" />
          <ReelAction d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
          <ReelAction d="M22 3L2 10l8 3 3 8 9-18z" />
          <ReelIcon d="M4 9h16M4 15h16" />
          <img
            src={audio?.previewUrl && audio.image ? audio.image : avatar}
            alt="audio"
            className="w-[28px] h-[28px] rounded-[6px] border-2 border-white object-cover"
          />
        </div>

        <div className="absolute left-[14px] right-[64px] bottom-[96px] flex flex-col gap-[8px] pointer-events-none">
          <div className="flex items-center gap-[10px]">
            <img
              src={avatar}
              alt="social"
              className="w-[34px] h-[34px] rounded-full object-cover border-2 border-white"
            />
            <div className="text-[14px] font-[600] truncate">{name}</div>
            <div className="border border-white/70 rounded-[8px] px-[12px] py-[2px] text-[13px] font-[600]">
              {t('instagram_preview_follow', 'Follow')}
            </div>
          </div>
          {!!caption && (
            <div
              dir="auto"
              className="text-[13px] leading-[17px] line-clamp-2 break-words"
            >
              {caption}
            </div>
          )}
          <div className="flex items-center gap-[6px] text-[12px]">
            <ReelIcon
              d="M9 18V5l12-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zm12-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"
              size={14}
            />
            <div className="truncate">
              {hasSong
                ? [audio?.title, audio?.artist].filter((f) => f).join(' · ')
                : t('instagram_preview_original_audio', 'Original audio')}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-[14px] bottom-[84px] h-[2px] bg-white/30 pointer-events-none">
          <div
            className="h-full bg-white"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="absolute inset-x-[14px] bottom-[12px] h-[56px] rounded-full bg-black/45 backdrop-blur flex items-center justify-around pointer-events-none">
          <ReelIcon d="M3 11l9-8 9 8v10h-6v-6H9v6H3z" />
          <div className="h-[44px] w-[64px] rounded-full bg-white/25 flex items-center justify-center">
            <ReelIcon
              d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM10 9l5 3-5 3z"
              fill="white"
            />
          </div>
          <ReelIcon d="M22 3L2 10l8 3 3 8 9-18z" />
          <ReelIcon d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-5-5" />
          <ReelIcon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0z" />
        </div>
      </div>
      <div className="text-[11px] opacity-70 text-center">
        {hasSong
          ? t(
              'instagram_preview_audio_approximate',
              'Approximate mix, Instagram creates the final audio'
            )
          : t(
              'instagram_preview_reel_approximate',
              'Approximate preview of the Reel feed'
            )}
      </div>
    </div>
  );
};

export const InstagramPreview: FC<{
  maximumCharacters?: number;
}> = (props) => {
  const { value: topValue, integration } = useIntegration();
  const current = useLaunchStore((state) => state.current);
  const mediaDir = useMediaDirectory();
  const { control } = useSettings();
  const audio = useWatch({ control, name: 'audio' }) as
    | PreviewAudio
    | undefined;
  const postType = useWatch({ control, name: 'post_type' });

  const renderContent = topValue.map((p) => {
    const newContent = stripHtmlValidation(
      'normal',
      p.content.replace(
        /<span.*?data-mention-id="([.\s\S]*?)"[.\s\S]*?>([.\s\S]*?)<\/span>/gi,
        (match, match1, match2) => {
          return `[[[${match2}]]]`;
        }
      ),
      true
    );

    const { start, end } = textSlicer(
      integration?.identifier || '',
      props.maximumCharacters || 10000,
      newContent
    );

    const finalValue =
      `<strong class="text-[15px] font-[600]">${integration?.name} </strong>` +
      `<span dir="auto">` +
      newContent
        .slice(start, end)
        .replace(/\[\[\[([.\s\S]*?)]]]/, (match, match1) => {
          return `<span class="font-bold font-[arial]" style="color: #ae8afc">${match1}</span>`;
        }) +
      `<mark class="bg-red-500" data-tooltip-id="tooltip" data-tooltip-content="This text will be cropped">` +
      newContent.slice(end).replace(/\[\[\[([.\s\S]*?)]]]/, (match, match1) => {
        return `<span class="font-bold font-[arial]" style="color: #ae8afc">${match1}</span>`;
      }) +
      `</mark></span>`;

    return {
      text: finalValue,
      images: p.image,
      plain: p.content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    };
  });

  const firstImages = renderContent?.[0]?.images;
  if (
    postType !== 'story' &&
    firstImages?.length === 1 &&
    hasExtension(firstImages[0].path, 'mp4')
  ) {
    return (
      <ReelFeedPreview
        src={mediaDir.set(firstImages[0].path)}
        audio={audio}
        avatar={integration?.picture || '/no-picture.jpg'}
        name={integration?.name || ''}
        caption={renderContent[0].plain}
      />
    );
  }

  return (
    <div className="py-[10px] flex flex-col px-[15px] w-full gap-[10px] bg-bgInstagram rounded-[12px]">
      <div className="flex gap-[10px] items-center">
        <div className="w-[36px] h-[36px]">
          <img
            src={integration?.picture || '/no-picture.jpg'}
            alt="social"
            className="rounded-full relative z-[2] w-[36px] h-[36px]"
          />
        </div>
        <div className="flex flex-col leading-[18px]">
          <div className="text-[15px] font-[600]">{integration?.name}</div>
        </div>
      </div>
      {!!renderContent?.[0]?.images?.length ? (
        <SliderComponent
          className="h-[585px] rounded-[8px] overflow-hidden"
          list={renderContent?.[0]?.images.map((image, index) => (
            <a
              key={`image_${index}`}
              className="flex-1"
              href={mediaDir.set(image.path)}
              target="_blank"
            >
              <VideoOrImage autoplay={true} src={mediaDir.set(image.path)} />
            </a>
          ))}
        />
      ) : (
        <div
          style={{ background: 'url(/no-video-youtube.png)' }}
          className="!bg-cover w-full aspect-[calc(16/9)] rounded-[8px] overflow-hidden"
        />
      )}
      <div
        dir="auto"
        className="text-[14px] font-[400] whitespace-pre-line"
        dangerouslySetInnerHTML={{
          __html: renderContent?.[0]?.text,
        }}
      />
      <div className="py-[8px] text-textColor flex text-[14px] font-[700] gap-[10.5px]">
        <div className="flex gap-[4px] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="20"
            viewBox="0 0 22 20"
            fill="none"
          >
            <path
              d="M10.7232 18.2722C10.7232 18.2722 0.792969 12.7112 0.792969 5.95866C0.792969 4.76493 1.20656 3.60807 1.96337 2.68491C2.72018 1.76175 3.77346 1.12932 4.94401 0.895206C6.11455 0.661097 7.33006 0.839776 8.38371 1.40084C9.43737 1.96191 10.2641 2.87071 10.7232 3.97261V3.97261C11.1823 2.87071 12.0091 1.96191 13.0627 1.40084C14.1164 0.839776 15.3319 0.661097 16.5024 0.895206C17.673 1.12932 18.7263 1.76175 19.4831 2.68491C20.2399 3.60807 20.6535 4.76493 20.6535 5.95866C20.6535 12.7112 10.7232 18.2722 10.7232 18.2722Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>121</div>
        </div>
        <div className="flex gap-[4px] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M4.5067 17.576C3.3239 15.5805 2.91017 13.2218 3.34318 10.9428C3.7762 8.66377 5.02618 6.6212 6.85846 5.1985C8.69075 3.7758 10.9793 3.07083 13.2946 3.21592C15.6098 3.36102 17.7924 4.34621 19.4328 5.98653C21.0731 7.62686 22.0583 9.80951 22.2034 12.1247C22.3485 14.44 21.6435 16.7285 20.2208 18.5608C18.7981 20.3931 16.7555 21.6431 14.4765 22.0761C12.1975 22.5091 9.83884 22.0954 7.84327 20.9126V20.9126L4.54642 21.846C4.41135 21.8855 4.26814 21.888 4.13179 21.8531C3.99545 21.8182 3.871 21.7473 3.77149 21.6478C3.67197 21.5483 3.60106 21.4238 3.56619 21.2875C3.53131 21.1512 3.53375 21.0079 3.57326 20.8729L4.5067 17.576Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>32</div>
        </div>
        <div className="flex gap-[4px] items-center flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M20.884 3.56475L2.37397 8.77813C2.21641 8.82121 2.07595 8.91181 1.97174 9.0376C1.86752 9.16339 1.80462 9.31824 1.79159 9.48107C1.77857 9.6439 1.81605 9.80679 1.89894 9.94754C1.98183 10.0883 2.1061 10.2001 2.25481 10.2677L10.7551 14.2894C10.9216 14.3665 11.0553 14.5003 11.1325 14.6668L15.1542 23.1671C15.2218 23.3158 15.3336 23.44 15.4743 23.5229C15.6151 23.6058 15.778 23.6433 15.9408 23.6303C16.1036 23.6172 16.2585 23.5543 16.3843 23.4501C16.5101 23.3459 16.6007 23.2055 16.6437 23.0479L21.8571 4.53791C21.8966 4.40284 21.8991 4.25962 21.8642 4.12328C21.8293 3.98694 21.7584 3.86249 21.6589 3.76297C21.5594 3.66346 21.4349 3.59255 21.2986 3.55767C21.1622 3.5228 21.019 3.52524 20.884 3.56475V3.56475Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.0117 14.4084L15.5002 9.91992"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex gap-[4px] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M19.0662 22.2443L12.7108 18.2722L6.35547 22.2443V4.76708C6.35547 4.55638 6.43917 4.35432 6.58815 4.20534C6.73713 4.05635 6.9392 3.97266 7.14989 3.97266H18.2718C18.4825 3.97266 18.6845 4.05635 18.8335 4.20534C18.9825 4.35432 19.0662 4.55638 19.0662 4.76708V22.2443Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {renderContent.length > 1 && (
        <>
          {renderContent.slice(1).map((value, index) => (
            <div key={index} className="flex flex-col gap-[12px]">
              <div className="flex gap-[10px] leading-[17px]">
                <div className="h-[34px]">
                  <img
                    src={integration?.picture || '/no-picture.jpg'}
                    alt="social"
                    className="rounded-full relative z-[2] h-[34px] w-[34px]"
                  />
                </div>
                <div className="flex flex-col gap-[6px] flex-1">
                  <div className="flex gap-[4px] py-[8px]">
                    <div
                      dir="auto"
                      className="whitespace-pre-line text-[14px] font-[400] flex-1"
                      dangerouslySetInnerHTML={{
                        __html: value.text,
                      }}
                    />
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 16.875C10 16.875 2.1875 12.5 2.1875 7.18751C2.1875 6.24836 2.51289 5.33821 3.1083 4.61193C3.70371 3.88564 4.53236 3.38808 5.45328 3.2039C6.37419 3.01971 7.33047 3.16029 8.15943 3.6017C8.98838 4.04311 9.63879 4.7581 10 5.62501V5.62501C10.3612 4.7581 11.0116 4.04311 11.8406 3.6017C12.6695 3.16029 13.6258 3.01971 14.5467 3.2039C15.4676 3.38808 16.2963 3.88564 16.8917 4.61193C17.4871 5.33821 17.8125 6.24836 17.8125 7.18751C17.8125 12.5 10 16.875 10 16.875Z"
                          stroke="currentColor"
                          strokeWidth="1.58884"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex font-[400] text-[12px] text-textLinkedin items-center">
                    <div className="flex gap-[16px] flex-1">
                      <div className="font-[700]">30m</div>
                      <div className="font-[700]">8 Likes</div>
                      <div className="font-[700]">Reply</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
