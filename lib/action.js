/**
 * @fileoverview Main action that handles fetching of the posts from the G+ API and rendering of the
 * feed.
 *
 * TODO(dan): Caching.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

var dys = require('dys');
var fs = require('fs');
var https = require('https');
var logger = require('logg').getLogger('gplusrss');
var path = require('path');
var RSS = require('rss');

var apiKey;

try {
  apiKey = process.env.G_API_KEY || fs.readFileSync(path.join(__dirname, '..', 'api-key'), 'utf8').trim();
} catch (e) {}

if (!apiKey) {
  logger.error('Environment variable G_API_KEY not set and no file api-key.');
  process.exit(1);
}

logger.info('Howdy!!');
logger.info('Using API Key: ' + apiKey);


/** Annotations for the action */
module.exports.annotations = {
  'valid-methods': ['GET']
}


/** The main method that handles a request. */
module.exports.execute = function(ctx) {
  var req = ctx.get('request');
  var res = ctx.get('response');
  var id = ctx.get('matches').id;

  var baseUrl = 'http://' + req.headers.host + '/'

  var options = {
    host: 'www.googleapis.com',
    port: 443,
    path: '/plus/v1/people/' + id + '/activities/public?key=' + apiKey,
    method: 'GET'
  };

  https.get(options, dys.errors.wrap(ctx, function(clientResp) {
    var data = ''
    clientResp.setEncoding('utf8');
    clientResp.on('data', function (d) { data += d; });
    clientResp.on('end', dys.errors.wrap(ctx, function () {
      var js = JSON.parse(data);
      if (js.error) {
        res.writeHead(js.error.code, {'Content-Type': 'text/plain'});
        res.end(js.error.message);
        logger.warn('Error fetching', options.path, js.error);

      } else if (js.items.length == 0) {
        logger.warn('No posts found for', options.path);
        throw new dys.errors.NotFoundError();

      } else {
        var feed = new RSS({
            title: js.items[0].actor.displayName + ' - Google+',
            description: 'Feed for public posts made on Google+',
            feed_url: baseUrl + id,
            site_url: js.items[0].actor.url,
            image_url: js.items[0].actor.image.url,
            author: js.items[0].actor.displayName
        });

        for (var i = 0; i < js.items.length; i++) {
          var item = js.items[i];
          if (item.verb != 'post') continue; // Only show original posts (not shares).
          if (item.object.objectType != 'note') continue; // Only show notes (not activity).
          if (item.title.indexOf('was tagged in') != -1) continue; // Ignore photo tags.

          feed.item({
              title:  getTitleFromItem(item),
              description: getDescriptionFromItem(item),
              url: item.object.url,
              date: item.published
          });
        }

        res.writeHead(clientResp.statusCode, {'Content-Type': 'application/rss+xml'});
        res.end(feed.xml(), 'utf8');
      }
    }));
  })).on('error', dys.errors.wrap(ctx, function(e) { throw e }));
}


/** Gets an item's title, using the attachment or a summary of G+'s extracted title. */
function getTitleFromItem(item) {
  var title;

  // Infer title from attachments.
  var att = item.object.attachments && item.object.attachments[0];
  if (att) {
    switch (att.objectType) {
      case 'photo': title = 'Photo: '; break;
      case 'album': title = 'Photo Album: '; break;
      case 'video': title = 'Video: '; break;
      case 'article': title = 'Link: '; break;
      default: title = 'Share: ' // Indicates a new type has been added.
    }
    title += att.displayName || summarize(item.title);

    // Strip the "(N photos)" string that is added to the display name.
    title = title.replace(/\([0-9]+ photos\)/, '')

  } else if (item.title) {
    title = summarize(item.title);
  } else {
    title = 'Post';
  }

  return title;
}


/** Extracts the first 6-words of the first sentence in a string. */
function summarize(str) {
  // Split on punctuation to get first sentence like thing.
  var sentence = str.split(/[\.,\/!:]/)[0];

  // Limit title to first 6 words.
  var parts = sentence.split(/ /);
  if (parts.length > 6) {
    parts.length = 6;
    parts.push('...');
  }

  str = parts.join(' ');
  return str;
}


/**
 * Creates the main RSS description field for the item.  Uses the user entered note plus some
 * info about any attachments on the post.
 */
function getDescriptionFromItem(item) {
  var description = item.object.content; // This is the user entered content, formatted HTML.
  description = '<p>' + description.replace(/(<br[^>]*>){2}/g, '</p><p>') + '</p>';

  var attachments = item.object.attachments || [];
  for (var i = 0; i < attachments.length; i++) {
    var att = attachments[i];
    switch (att.objectType) {
      case 'album':
        description += '<p class="album-link"><a href="' + att.thumbnails[0].url + '">';
        description += '<img src="' + att.thumbnails[0].image.url + '">';
        description += '</a></p>';
        break;
      case 'photo':
        description += '<p class="photo-link"><a href="' + att.url + '"><img src="' + att.image.url + '"></a></p>';
        break;
      case 'video':
        description += '<p class="video-preview"><a href="' + att.url + '"><img src="' + att.image.url + '"></a></p>';
        break;
      case 'article':
        description += '<div class="link-box">';
        if (att.image) {
          description += '<p class="link-image"><a href="' + att.url + '"><img src="' + att.image.url + '"></a></p>';
        }
        description += '<p class="link-text"><a href="' + att.url + '">' + att.displayName + '&raquo;</a><br>';
        description += att.content + '</p>';
        description += '</div>';
        break;
    }
  }

  return description;
}
