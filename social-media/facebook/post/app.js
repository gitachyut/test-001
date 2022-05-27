const rp = require("request-promise-native"); // requires installation of `request`
const cheerio = require("cheerio");

// const date_service = require('../../../service/date.js');

const COMMENT_COUNT_STRING = ",comment_count:";
const LIKE_COUNT_STRING = ",like_count:";
const SHARE_COUNT_STRING = ",share_count:";
const ENTITY_COUNT_STRING = ",entity_id:";
const TIME_STRING = ',"uploadDate":';

const INSIGHT_SELECTOR = ".async_like";
const POST_WRAPPER_SELECTOR = ".story_body_container:first";
const POST_SELECTOR = "._5rgt._5nk5";
const SHARED_TEXT_SELECTOR = "._24e4._2xbh";
const USERNAME_SELECTOR = "h3 strong a";
const TIME_SELECTOR = "abbr:first";

class FbScrape {
  constructor(options = {}) {
    this.headers = options.headers || {
      "User-Agent":
        "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:64.0) Gecko/20100101 Firefox/64.0", // you may have to update this at some point
      "Accept-Language": "en-US,en;q=0.5",
      cookie: "locale=en_US;",
    };
    this.html = null;
    this.result = {
      postID: null,
      userID: null,
      title: null,
      post: null,
      sharedText: null,
      userfullname: null,
      username: null,
      time: null,
      like_count: null,
      comment_count: null,
      share_count: null,
      type: null,
      insights: {},
      url: null,
      external_url: null,
      error: false,
    };
    this.postURL = null;
    this.mobileURL = null;
    this.mbasicURL = null;
    this.isVideo = false;
    this.isPhoto = false;
    this.isPost = false;
  }

  async linkDetect() {
    const linkMetaDate = new URL(this.postURL);
    const domainOrigin = linkMetaDate.origin;
    const host = linkMetaDate.host;
    const pathName = linkMetaDate.pathname;
    const searchPath = linkMetaDate.search;

    if (host.indexOf("facebook") > -1) {
      this.mobileURL = "https://m.facebook.com" + pathName + searchPath;
      this.mbasicURL = "https://mbasic.facebook.com" + pathName + searchPath;

      if (pathName.indexOf("posts") > -1 || this.isPost) {
        this.result.type = "Post";
        this.isPost = true;
        const staticPostsHtml = await this.curlRequest(this.mobileURL);
        const staticPosts = this._parsePostsHtml(staticPostsHtml);
        return staticPosts;
      } else if (
        pathName.indexOf("photos") > -1 ||
        pathName.indexOf("photo") > -1 ||
        this.isPhoto
      ) {
        this.result.type = "Photo";
        this.isPhoto = true;
        const staticPostsHtml = await this.curlRequest(this.mbasicURL);
        const staticPosts = this._parsePhotosHtml(staticPostsHtml);
        return staticPosts;
      } else if (
        pathName.indexOf("videos") > -1 ||
        pathName.indexOf("watch") > -1 ||
        pathName.indexOf("video") > -1 ||
        this.isVideo
      ) {
        this.result.type = "Video";
        this.isVideo = true;
        const staticPostsHtml = await this.curlRequest(this.mbasicURL);
        const staticPosts = this._parseVideoHtml(staticPostsHtml);
        return staticPosts;
      } else if (pathName.indexOf("groups") > -1) {
        this.result.type = "Post";
        const staticPostsHtml = await this.curlRequest(this.mobileURL);
        const staticPosts = this._parsePostsHtml(staticPostsHtml);
        return staticPosts;
      } else {
        this.result.type = "Post";
        const staticPostsHtml = await this.curlRequest(this.mobileURL);
        const staticPosts = this._parsePostsHtml(staticPostsHtml);
        return staticPosts;
      }
    } else {
      this.result.error = true;
      return this.result;
    }
  }

  async curlRequest(url) {
    console.log("url", url);
    const staticPostsHtml = await rp.get({
      url: url,
      headers: this.headers,
    });
    return staticPostsHtml;
  }

  async getPosts(postURL, type = "post") {
    if (type === "photo") {
      this.isPhoto = true;
    } else if (type === "video") {
      this.isVideo = true;
    } else {
      this.isPost = true;
    }

    this.postURL = postURL;
    this.result.url = postURL;
    const results = await this.linkDetect();
    return results;
  }

  async findCount(str) {
    let re = new RegExp(str + "\\d{1,}");
    let count = this.html.match(re);
    if (count) {
      count = count[0];
      count = count.split(",")[1];
      count = count.split(":")[1];
      return this.parseKm(count);
    } else {
      return 0;
    }
  }

  findDate(str) {
    let re =
      /(,"uploadDate":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-\d{2}:\d{2})"/;
    let date = this.html.match(re);
    // console.log(date[0])
    if (date) {
      date = date[0];
      date = date.split(',"uploadDate":')[1];
      // console.log(date);
      return date;
    } else {
      return new Date();
    }
  }

  parseKm(number_string) {
    if (number_string.match("K") || number_string.match("k")) {
      number_string = parseFloat(number_string);
      number_string = number_string * 1000;
      return number_string;
    } else if (number_string.match("M") || number_string.match("m")) {
      number_string = parseFloat(number_string);
      number_string = number_string * 1000000;
      return number_string;
    } else {
      number_string = parseFloat(number_string);
      return number_string;
    }
  }

  findUsername() {
    let re = new RegExp(",permalink:.*/,");
    let username = this.html.match(re);
    if (username) {
      username = username[0];
      console.log("username", username);
    } else {
      return "username";
    }
  }

  async reactionfinder() {
    const staticPostsHtml = await this.curlRequest(this.mobileURL);
    const $ = cheerio.load(staticPostsHtml);
    this.html = $.html();
    try {
      this.result.comment_count = await this.findCount(COMMENT_COUNT_STRING);
      this.result.like_count = await this.findCount(LIKE_COUNT_STRING);
      this.result.share_count = await this.findCount(SHARE_COUNT_STRING);
      return true;
    } catch (error) {
      this.result.error = true;
      return true;
    }
  }

  async datefinder() {
    const staticPostsHtml = await this.curlRequest(this.mobileURL);
    const $ = cheerio.load(staticPostsHtml);
    this.html = $.html();
    try {
      var postWrapper = $("#mobile_injected_video_feed_pagelet");
      this.result.userID = await this.findCount(ENTITY_COUNT_STRING);
      var timeString = this.findDate(TIME_STRING);
      // this.result.time = await date_service(timeString);
      return true;
    } catch (error) {
      console.log(error);
      this.result.error = true;
      return true;
    }
  }

  async findPostId() {
    // https://www.facebook.com/watch/?v=640235149902017
    // https://www.facebook.com/voompla/videos/640235149902017/
    // https://www.facebook.com/permalink.php?id=1636457193277990&story_fbid=640235149902017
    const _x = new URL(this.postURL);
    const pathName = _x.pathname;
    const searchPath = _x.search;

    let post_id = "";
    if (pathName.split("/")[3]) {
      post_id = pathName.split("/")[3];
    } else if (searchPath.split("?v=")[1]) {
      post_id = searchPath.split("?v=")[1];
    } else if (searchPath.split("&story_fbid=")[1]) {
      post_id = searchPath.split("&story_fbid=")[1];
    } else if (searchPath.split("fbid=")[1].split("&")[0]) {
      post_id = searchPath.split("fbid=")[1].split("&")[0];
    }

    this.result.postID = Number(post_id);
  }

  async _parsePostsHtml(postsHtml) {
    const $ = cheerio.load(postsHtml);
    this.html = $.html();
    try {
      const title = $("title").text();
      this.result.title = title;

      const isvideo = $("._9b98").text();
      if (isvideo === "Facebook Watch") {
        this.result.error = true;
      } else {
        const insights = $(INSIGHT_SELECTOR).data("ft");
        this.result.userID = insights.page_id || insights.content_owner_id_new;
        this.result.postID =
          insights.mf_story_key || insights.top_level_post_id;
        this.result.insights = insights;

        this.result.comment_count = await this.findCount(COMMENT_COUNT_STRING);
        this.result.like_count = await this.findCount(LIKE_COUNT_STRING);
        this.result.share_count = await this.findCount(SHARE_COUNT_STRING);

        const postWrapper = $(POST_WRAPPER_SELECTOR);
        this.result.post = postWrapper.find(POST_SELECTOR).text();

        let sharedText_01 = postWrapper.find("._24e4._2xbh header h4").text();
        let sharedText_02 = postWrapper
          .find("._24e4._2xbh header h3 span")
          .text();
        let sharedText_03 = postWrapper
          .find("._24e4._2xbh ._2rbw._5tg_")
          .text();

        this.result.sharedText =
          sharedText_01 + "\n" + sharedText_02 + "\n" + sharedText_03;
        this.result.userfullname = postWrapper.find(USERNAME_SELECTOR).text();
        this.result.username =
          postWrapper
            .find(USERNAME_SELECTOR)
            .attr("href")
            .split("/")[1]
            .split("?")[0] || this.result.userfullname;
        // this.result.time = await date_service(postWrapper.find(TIME_SELECTOR).text());
      }

      return this.result;
    } catch (error) {
      this.result.error = true;
      return this.result;
    }
  }

  async _parsePhotosHtml(postsHtml) {
    const $ = cheerio.load(postsHtml);
    this.html = $.html();
    try {
      const title = $("title").text();
      this.result.title = title;

      // const insights = $(INSIGHT_SELECTOR).data('ft');
      // this.result.userID = insights.page_id || insights.content_owner_id_new;
      // this.result.postID = insights.mf_story_key || insights.top_level_post_id;
      // this.result.insights = insights;

      await this.reactionfinder();

      const postWrapper = $("#MPhotoContent");
      this.result.post = postWrapper.find(".msg div").text();
      this.result.userfullname = postWrapper.find(".actor").text();
      // this.result.time = await date_service(postWrapper.find(TIME_SELECTOR).text());

      await this.findPostId();

      return this.result;
    } catch (error) {
      this.result.error = true;
      return this.result;
    }
  }

  async _parseVideoHtml(postsHtml) {
    const $ = cheerio.load(postsHtml);
    this.html = $.html();
    try {
      const title = $("title").text();
      this.result.title = title;

      // this.result.userID = insights.page_id || insights.content_owner_id_new;
      // this.result.postID = insights.mf_story_key || insights.top_level_post_id;

      const postWrapper = $("#mobile_injected_video_feed_pagelet");
      this.result.userfullname = postWrapper.find(USERNAME_SELECTOR).text();
      this.result.post =
        postWrapper.find("._9dgr span").text() +
        " \n" +
        postWrapper.find("._9dgu span").text();
      this.result.comment_count = this.parseKm(
        postWrapper.find("._1fnt span:first").text().split("comments")[0]
      );
      this.result.like_count = this.parseKm(postWrapper.find("._1g06").text());
      this.result.share_count = this.parseKm(
        postWrapper.find("._1fnt span:last").text().split("shares")[0]
      );

      this.result.sharedText = postWrapper.find(".bx .ch div").text();

      await this.datefinder();
      await this.findPostId();
      return this.result;
    } catch (error) {
      console.log(error);
      this.result.error = true;
      return this.result;
    }
  }
}

const fbScrape = new FbScrape();

const url =
  "https://www.facebook.com/SpeakMandarinCampaign/posts/6180518052018411";
const type = "post";

fbScrape
  .getPosts(url, type)
  .then(async (articlePost) => {
    console.log("articlePost", articlePost);
  })
  .catch((err) => console.log("ERR", err));
