const POSTID = 'story_fbid';
const PROFILEID = 'id';

const findCodeFromURL = (url, key) => {
    console.log(url)
  const r = new URL(url);
  let x;
  if (key === POSTID)
    x = new URLSearchParams(r.search).get(POSTID);

  if (key === PROFILEID)
    x = new URLSearchParams(r.search).get(PROFILEID);

  if (x) return x;
  return null;
};


module.exports = {
    findCodeFromURL,
    POSTID,
    PROFILEID
}