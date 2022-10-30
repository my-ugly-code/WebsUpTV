parseString = require('xml2js').parseString;
request = require('request'); //there's probably a way to not have this duplicated here and app.js...besides passing request into processPayload()


var Plex = module.exports = {
     processPayload: async function(config, req) {
          //console.log('in with....');
          //console.log(req.body);
          let usefulData = await cleanData(config, req);
          console.log('usefulData.type:', usefulData.type);
          if(usefulData.type == 'episode'){ //so we call that twice? need to sort out promises
            let gParent = await getParentMedia(usefulData.topKey);
            console.log('got parent: ', JSON.stringify(gParent));
            //console.log(gParent.MediaContainer.$.librarySectionTitle)
            usefulData.parent = gParent;
            try{
              usefulData.parentRec = gParent.MediaContainer.Directory[0].$;
            }
            catch(e){
              console.log('did not get episode parent, ok if not episode');
            }
            usefulData.roles = await getRolesFromParent(gParent); //want these to fit in like movie roles
          }
          console.log('returning: ', usefulData);
          return usefulData;
    }/*,
    somethingelse: function() {
        console.log('something else');
    }*/
}



function getRolesFromParent(parent){
  let roles = [];
  return new Promise(resolve => {
    if(parent && parent.MediaContainer){
      parent.MediaContainer.Directory[0].Role.forEach(function(role){
        var pRole = role.$;
        pRole.randColor = colorGen()
        //console.log('ROLE:', role);
        roles.push(pRole);
      });
    }

    //console.log('GOT PARENT ROLES: ', roles);
    resolve(roles);
  });
}


function cleanData(config, req){
  return new Promise(resolve => {
      let payload = JSON.parse(req.body.payload);
      console.log('PLEX WEBHOOK PAYLOAD::::: ',JSON.stringify(payload));

      //for episodes, some things are pulled from parent/grandparent - eg. roles, art
      if(payload.Metadata.grandparentThumb == undefined){
        payload.Metadata.grandparentThumb = payload.Metadata.thumb;
      }
      var usefulData = {
          roles: payload.Metadata.Role, //empty if type = episode
          title: payload.Metadata.title,
          rating: payload.Metadata.contentRating,
          summary: payload.Metadata.summary,
          posterurl: 'http://'+config.plexServerIp+':32400'+payload.Metadata.grandparentThumb+'?X-Plex-Token='+config.plexToken,
          type: payload.Metadata.type, //episode, clip (trailer), movie
          show: payload.Metadata.grandparentTitle,
          topKey: payload.Metadata.grandparentKey,
          event: payload.event,
          releaseDate: payload.Metadata.originallyAvailableAt,
          pipUrl: 'http://192.168.1.209:32400/web/index.html#!/server/'+payload.Server.uuid+'/details?key='+payload.Metadata.grandparentKey
      };


     resolve(usefulData); 
  });
}




function colorGen(){
  return 'rgb('+getRandomInt(110,175)+' '+getRandomInt(110,175)+' '+getRandomInt(110,175)+')';
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}



//for type episode, need to look at grandparent, sample for media below
// http://config.plexServerIp:32400/library/metadata/7744?X-Plex-Token=config.plexToken
function getParentMedia(key){
  return new Promise(resolve => {


    console.log('KEY???', key);    ///should be in format /library/metadata/12345

      var clientServerOptions = {
          uri: 'http://'+config.plexServerIp+':32400'+key+'?X-Plex-Token='+config.plexToken,
          method: 'GET'
      }
      request(clientServerOptions, function (error, response, body) {
          parseString(body, function (err, result) {
            resolve(result);
          });
      });
  });

  
  //console.log('test test test');
}






////SAMPLE EPISODE JSON/////
/*
{
  "event": "media.resume",
  "user": true,
  "owner": true,
  "Account": {
    "id": 924920,
    "thumb": "https://plex.tv/users/80xxxxxxxxxxxxxxad/avatar?c=16xxxxxxxxx54",
    "title": "Allison_Wonderland"
  },
  "Server": {
    "title": "Plex Main",
    "uuid": "e90xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxe14"
  },
  "Player": {
    "local": true,
    "publicAddress": "XXX.XXX.XXX.179",
    "title": "Chrome",
    "uuid": "lbxxxxxxxxxxxxxxxxxxxxxe5"
  },
  "Metadata": {
    "librarySectionType": "show",
    "ratingKey": "8150",
    "key": "/library/metadata/8150",
    "parentRatingKey": "7751",
    "grandparentRatingKey": "7744",
    "guid": "plex://episode/60341406ae8595002c187924",
    "parentGuid": "plex://season/602e774fc96042002d099b4d",
    "grandparentGuid": "plex://show/5d9f40086fc551001ef8e688",
    "type": "episode",
    "title": "Palm Beach County, FL 11",
    "grandparentKey": "/library/metadata/7744",
    "parentKey": "/library/metadata/7751",
    "librarySectionTitle": "TV Shows",
    "librarySectionID": 3,
    "librarySectionKey": "/library/sections/3",
    "grandparentTitle": "Cops",
    "parentTitle": "Season 14",
    "contentRating": "TV-MA",
    "summary": "",
    "index": 1,
    "parentIndex": 14,
    "viewOffset": 336000,
    "viewCount": 1,
    "lastViewedAt": 1665187453,
    "thumb": "/library/metadata/8150/thumb/1633852677",
    "art": "/library/metadata/7744/art/1652409778",
    "parentThumb": "/library/metadata/7751/thumb/1633852676",
    "grandparentThumb": "/library/metadata/7744/thumb/1652409778",
    "grandparentArt": "/library/metadata/7744/art/1652409778",
    "grandparentTheme": "/library/metadata/7744/theme/1652409778",
    "duration": 1500000,
    "originallyAvailableAt": "2001-09-01",
    "addedAt": 1469122046,
    "updatedAt": 1633852677,
    "Guid": [
      {
        "id": "tvdb://445575"
      }
    ]
  }
}
*/