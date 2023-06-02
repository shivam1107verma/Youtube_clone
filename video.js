//to access the cookie
const apiKey = localStorage.getItem("api_key");
let cookieString = document.cookie;
let videoId = cookieString.split("=")[1];
//console.log(videoId);
let firstScript = document.getElementsByTagName("script")[0];

firstScript.addEventListener("load", onLoadScript);

function onLoadScript() {
  if (YT) {
    new YT.Player("abc", {
      height: "550",
      width: "950",
      videoId,
      events: {
        onReady: (event) => {
          document.title = event.target.videoTitle;
          extractVideoDetails(videoId);
          fetchStats(videoId);
        },
      },
    });
  }
}

const statsContainer = document.getElementsByClassName("video-details")[0];
async function extractVideoDetails(videoId) {
  //console.log("inside extract video" + videoId);
  let endpoint = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}`;
  try {
    let response = await fetch(endpoint);
    let result = await response.json();
    console.log(result);
    renderComments(result.items);
  } catch (error) {
    console.log("error occured", error);
  }
}

async function fetchStats(videoId) {
  console.log("inside fetchstat");
  let endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${apiKey}&id=${videoId}`;
  try {
    let response = await fetch(endpoint);
    let result = await response.json();
    console.log(result); //title,description statistics

    let item = result.items[0];
    let imageurl = item.snippet.thumbnails.high.url;
    const title = document.getElementById("title");
    title.innerText = item.snippet.title;
    title.style.color = "white";
    title.style.fontSize = "22px";
    statsContainer.innerHTML = `
    
    <div class="profile">
    <img src="${imageurl}" class="channel-logo" alt="">
    <div class="owner-detail">
        <span >${item.snippet.channelTitle}</span>
         <span class="subscriber">20 Subscribers</span>
    </div>
</div>
    <div class="stats">
        <div class="like-container">
            <div class="like">
                <span class="material-icons">thumb_up</span>
                <span>${item.statistics.likeCount}</span>
            </div>
            <div class="dislike">
                <span class="material-icons">thumb_down</span>
            </div>
        </div>
        <div class="comment-container">
            <span class="material-icons">comment</span>
            <span>${item.statistics.commentCount}</span>
        </div>
    </div>
                                    `;
  } catch (error) {
    console.log("error occured", error);
  }
}

function renderComments(commentList) {
  const commentsContainer = document.getElementById("comment-container");

  for (let i = 0; i < commentList.length; i++) {
    let comment = commentList[i];
    const topLevelComment = comment.snippet.topLevelComment;
    let commentElement = document.createElement("div");
    commentElement.className = "comment";
    commentElement.innerHTML = `
    <img src="${topLevelComment.snippet.authorProfileImageUrl}" alt="">
    <div class="comment-right-half">
        <b>${topLevelComment.snippet.authorDisplayName}</b>
        <p>${topLevelComment.snippet.textDisplay}</p>
        <div class="options">
            <div class="like">
                <span class="material-icons">thumb_up</span>
                <span>${topLevelComment.snippet.likeCount}</span>
            </div>
            <div class="dislike">
                <span class="material-icons">thumb_down</span>
            </div>
            <button class="reply" onclick="loadComment(this)" data-comment-id = "${topLevelComment.id}">
            Replies(${comment.snippet.totalReplyCount})
        </button>
        </div>
       
    </div>
    `;
    commentsContainer.append(commentElement);
  }
}

async function loadComment(element) {
  const commentId = element.getAttribute("data-comment-id");
  console.log(commentId);
  let endpoint = `https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=${commentId}&key=${apiKey}`;
  try {
    let response = await fetch(endpoint);
    let result = await response.json();

    //console.log(result);
    const parentNode = element.parentNode.parentNode;
    let commentList = result.items;
    for (let i = 0; i < commentList.length; i++) {
      let replyComment = commentList[i];
      let commentNode = document.createElement("div");
      commentNode.className = "comment-reply comment";
      commentNode.innerHTML = `
      <img src="${replyComment.snippet.authorProfileImageUrl}" alt="">
      <div class="comment-right-half">
          <b>${replyComment.snippet.authorDisplayName}</b>
          <p>${replyComment.snippet.textOriginal}</p>
          <div class="options">
              <div class="like">
                  <span class="material-icons">thumb_up</span>
                  <span>${replyComment.snippet.likeCount}</span>
              </div>
              <div class="like">
                  <span class="material-icons">thumb_down</span>
              </div>
          </div>
  `;

      parentNode.append(commentNode);
    }
  } catch (error) {
    console.log("erron occured", error);
  }
}
