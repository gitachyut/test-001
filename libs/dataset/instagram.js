var moment = require('moment-timezone');
// { 
//    url:'https://www.instagram.com/p/CI782nRhpxF/?utm_source=ig_web_copy_link',
//    title: 'Tanoto Foundation bekerja sama',
//    post:'Tanoto Foundation bekerja sama dengan Temasek Foundation mendonasikan satu unit mesin ekstraksi MGI RNA, satu unit mesin uji PCR dan 10,000 tes kit PCR kepada GSI Lab, perusahaan social enterprise yang berbasis di Indonesia, sebagai upaya meningkatkan kapasitas pengujian COVID-19 di Indonesia.\n\nKolaborasi ini, merupakan kerja sama pertama di antara kedua organisasi, yang diharapkan dapat membantu meningkatkan kapasitas GSI Lab yang saat ini mampu melakukan 5.000 pengujian per harinya hingga 12%.\n\nPenyerahan bantuan dilakukan secara simbolis di Kedutaan Besar Republik Indonesia di Singapura pada tanggal 9 Desember 2020. Acara tersebut dihadiri oleh Dubes Indonesia untuk Singapura Suryo Protomo, Anggota Dewan Pembina Tanoto Foundation, Anderson Tanoto serta perwakilan GSI Lab melalui Zoom.\n\nTanoto Foundation berharap kolaborasi ini bisa membantu meningkatkan kapasitas tes Covid-19 di Indonesia untuk mengatasi pandemi COVID-19.\n\n#tanotofoundation #temasekfoundation',
//    postDate: '2020-12-24T18:14',
//    author: 'tanotoeducation',
//    media: { value: 'instagram', label: 'Instagram' },
//    post_type: { value: 'video', label: 'Video' },
//    comments: '11',
//    likes: '11',
//    shares: '11',
//    views: '11',
//    bussinessId: 16,
//    projectId: 'ec75b080-fd23-11ea-a764-33251edf7f99' 
// }

let dataset = (data) => {
    return {
        "__typename": "GraphImage",
        "comments_disabled": false,
        "dimensions": {
            "height": 1080,
            "width": 1080
        },
        "display_url": "",
        "edge_media_preview_like": {
            "count": data.likes ? parseInt(data.likes) : 0
        },
        "edge_media_to_caption": {
            "edges": [
                {
                    "node": {
                        "text": data.post
                    }
                }
            ]
        },
        "edge_media_to_comment": {
            "count": data.comments ? parseInt(data.comments) : 0
        },
        "id": `${data.id}`,
        "is_video": false,
        "owner": {
            "biography": "The younger people run this account.",
            "blocked_by_viewer": false,
            "business_category_name": "Publishers",
            "category_enum": "NEWS_SITE",
            "category_name": "News & Media Website",
            "connected_fb_page": null,
            "country_block": false,
            "edge_felix_video_timeline": {},
            "edge_follow": {
                "count": 360
            },
            "edge_followed_by": {
                "count": 389345
            },
            "edge_mutual_followed_by": {
                "count": 0,
                "edges": []
            },
            "edge_related_profiles": {},
            "external_url": data.url,
            "external_url_linkshimmed": data.url,
            "followed_by_viewer": false,
            "follows_viewer": false,
            "full_name": data.author,
            "has_ar_effects": false,
            "has_blocked_viewer": false,
            "has_channel": false,
            "has_clips": false,
            "has_guides": false,
            "has_requested_viewer": false,
            "highlight_reel_count": 73,
            "id": "479894638",
            "is_business_account": true,
            "is_joined_recently": false,
            "is_private": false,
            "is_verified": true,
            "overall_category_name": null,
            "profile_pic_url": data.url,
            "profile_pic_url_hd": data.url,
            "requested_by_viewer": false,
            "restricted_by_viewer": null,
            "username": data.author
        },
        "shortcode": "CB2ArOEnEjY",
        "taken_at_timestamp": 1593057705,
        "thumbnail_resources": [],
        "thumbnail_src": null,
        "tag": data.author,
        "media": "instagram",
        "post": data.post,
        "post_date": moment(data.postDate, "YYYY-MM-DDTHH:mm:ss.SSSZZ"),
        "external_url":  data.url,
        "url": data.url,
        "thumbnail": null,
        "post_type": data.post_type.value,
        "view_count":  data.views ? parseInt( data.views ) : 0,
        "title": data.title || null
    }
};


module.exports = {
    instagram: dataset
};