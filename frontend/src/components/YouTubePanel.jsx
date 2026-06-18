import "./YouTubePanel.css";

function YouTubePanel({ videos }) {
  if (!Array.isArray(videos) || videos.length === 0) {
    return null;
  }

  return (
    <div className="youtube-container">
      <h2>Related YouTube Videos</h2>

      <div className="youtube-grid">
        {videos.map((video, index) => {
          // Safe extraction (handles backend variations)
          const videoId =
            video.video_id ||
            video.videoId ||
            video.id?.videoId;

          const title =
            video.title ||
            video.snippet?.title ||
            "Untitled Video";

          const channel =
            video.channel_title ||
            video.snippet?.channelTitle ||
            "Unknown Channel";

          const videoUrl =
            video.video_url ||
            (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "#");

          const embedUrl =
            video.embed_url ||
            (videoId
              ? `https://www.youtube.com/embed/${videoId}`
              : "");

          return (
            <div key={videoId || index} className="video-card">
              {embedUrl && (
                <iframe
                  title={title}
                  src={embedUrl}
                  allowFullScreen
                />
              )}

              <div className="video-content">
                <h3>{title}</h3>

                <p>
                  <strong>Channel:</strong> {channel}
                </p>

                {videoUrl !== "#" && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch on YouTube
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default YouTubePanel;