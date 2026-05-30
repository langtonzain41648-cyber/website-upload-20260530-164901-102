(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setMessage(player, message) {
    var messageNode = player.querySelector(".player-message");
    if (messageNode) {
      messageNode.textContent = message || "";
    }
  }

  function initPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-overlay");
    var stream = player.getAttribute("data-stream");
    var hls = null;
    var initialized = false;

    if (!video || !button || !stream) {
      return;
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setMessage(player, "正在加载播放源...");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.classList.add("is-ready");
          setMessage(player, "播放源已就绪");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage(player, "视频加载失败，请刷新页面或检查播放源。 ");
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        player.classList.add("is-ready");
        setMessage(player, "播放源已就绪");
        return Promise.resolve();
      }

      setMessage(player, "当前浏览器不支持 HLS 播放。建议使用新版 Chrome、Edge 或 Safari。 ");
      return Promise.reject(new Error("HLS is not supported"));
    }

    button.addEventListener("click", function () {
      attachSource().then(function () {
        return video.play();
      }).then(function () {
        player.classList.add("is-playing");
        button.classList.add("hidden");
        setMessage(player, "");
      }).catch(function () {
        setMessage(player, "浏览器阻止了自动播放，请再次点击视频控件播放。 ");
      });
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
      button.classList.add("hidden");
      setMessage(player, "");
    });

    video.addEventListener("pause", function () {
      player.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(initPlayer);
  });
})();
