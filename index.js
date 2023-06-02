let inputElement = document.getElementById("search");
const apiKey = "AIzaSyBQ5Mz54R1f0fXo5Di_gR4AFxRAXu1m4hY";
localStorage.setItem("api_key", apiKey);
const container = document.getElementById("container");
/*
    https://youtube.googleapis.com/youtube/v3/search?part=snippet,statistics&maxResults=1&q=mycodeschool&key=AIzaSyBprXFgJkoIn4TkCLOCXd9HLOujKmt9evk
*/

function SearchVideos() {
  let searchValue = inputElement.value;
  fetchVideo(searchValue);
}

async function fetchVideo(searchValue) {
  let endPoint = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${searchValue}&key=${apiKey}`;

  try {
    let response = await fetch(endPoint);

    let result = await response.json();

    for (let i = 0; i < result.items.length; i++) {
      let video = result.items[i];
      let videoStats = await fetchStats(video.id.videoId);
      //console.log(videoStats);
      if (videoStats.items.length > 0) {
        result.items[i].videoStats = videoStats.items[0].statistics;
        result.items[i].duration = videoStats.items[0].contentDetails
          ? videoStats.items[0].contentDetails.duration
          : "NA";
      }
    }
    //console.log(result);
    showThumbnails(result.items);
  } catch (error) {
    console.log(error);
    alert("something went wrong");
  }
}

async function fetchStats(videoId) {
  const endPoint = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=statistics,contentDetails&id=${videoId}`;
  let response = await fetch(endPoint);
  let result = await response.json();
  return result;
}

function getViews(n) {
  if (n < 1000) {
    return n;
  } else if (n >= 1000 && n <= 999999) {
    n /= 1000;
    n = parseInt(n);
    return n + "K";
  }
  return parseInt(n / 1000000) + "M";
}

//show thumbnail
function showThumbnails(items) {
  for (let i = 0; i < items.length; i++) {
    let videoItem = items[i];
    let imageUrl = videoItem.snippet.thumbnails.high.url;
    let videoElement = document.createElement("div");
    videoElement.addEventListener("click", () => {
      navigateToVideo(videoItem.id.videoId);
    });
    // videoElement.style.backgroundImage = `url(${imageUrl})`;
    // videoElement.id = videoItem.id.videoId;
    // videoElement.innerHTML = `<p class="title">${videoItem.snippet.title}</p>`;
    let videoChildren = `<img src="${imageUrl}">
                          <b>${formattedData(videoItem.duration)}</b>
                          <p class="title">${videoItem.snippet.title}</p>
                          <p class="channel-title">${
                            videoItem.snippet.channelTitle
                          }</p>
                          <p class="viewCount">${
                            videoItem.videoStats
                              ? getViews(videoItem.videoStats.viewCount) +
                                " " +
                                "Views"
                              : "NA"
                          }</p>`;
    videoElement.innerHTML = videoChildren;
    container.append(videoElement);
  }
}

function formattedData(duration) {
  if (!duration) return "NA";
  // PT2H33M23S
  // let hrs = duration.slice(2, 4);
  // let mins = duration.slice(5, 7);
  // let seconds;
  // if (duration.length > 8) {
  //   seconds = duration.slice(8, 10);
  // }
  // let str = `${hrs}:${mins}`;
  // seconds && (str += `:${seconds}`);
  // return str;
  let time = duration
    .toUpperCase()
    .replace("PT", "")
    .replace("H", ":")
    .replace("M", ":")
    .replace("S", "");
  if (time.endsWith(":")) {
    time = time.substring(0, time.length - 2);
  }
  return time;
}

// >1000 display as it is
// >1000 < 999999 divide with 100 and add suffix k
// > 1000 000 divide with 100 and add suffix m

function navigateToVideo(videoId) {
  if (videoId) {
    ///path:YouTube-clone/video.html
    let path = `YouTube-clone/video.html`;
    document.cookie = `video_Id = ${videoId}; path=${path}`;
    // window.location.href = "http://127.0.0.1:5500/YouTube-clone/video.html";
    let linkItem = document.createElement("a");
    linkItem.href = "./video.html";
    linkItem.target = "_blank";
    linkItem.click();
  } else {
    alert("Go and watch on youTube");
  }
}
