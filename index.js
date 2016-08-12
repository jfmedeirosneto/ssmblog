/*!
 * ssmblog Super Simple Markdown Blog
 * https://github.com/jfmedeirosneto/ssmblog
 * Copyright(c) 2016 João Neto <jfmedeirosneto@yahoo.com.br>
 */

'use strict';

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

/*
 * Express session middleware
 */
var session = require('express-session');
app.use(session({secret: 'put your secret here', resave: false, saveUninitialized: true}));

var nunjucks = require('nunjucks');
var env = nunjucks.configure('views', {
    autoescape: false,
    express: app
});

var nunjucksDate = require('nunjucks-date');
nunjucksDate.setDefaultFormat('MM/DD/YYYY HH:mm');
nunjucksDate.install(env);

var nunjucksMarkdown = require('nunjucks-markdown');
var marked = require('marked');
nunjucksMarkdown.register(env, marked);

var fs = require('fs');
var path = require('path');
var util = require('util');

var showdown = require('showdown');
var footnotes = require('showdown-footnotes');
var converter = new showdown.Converter({extensions: [footnotes]});

var yaml = require('js-yaml');

/*
 * To test contact form locally use "Free Fake SMTP Server" software
 * https://nilhcem.github.io/FakeSMTP/
 * WARNING: Some web hosts do not allow emails to be sent through forms to common mail hosts like Gmail or Yahoo.
 * It's recommended that you use a private domain email address!
 */
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    auth: {
        user: '',
        pass: ''
    }
});

Array.prototype.chunk = function (size) {
    var arr = this;
    return arr.map(function (e, i) {
        return i % size === 0 ? arr.slice(i, i + size) : null;
    }).filter(function (e) {
        return e;
    });
};

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return str.length > 0 && this.substring(0, str.length) === str;
    }
}
;

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return str.length > 0 && this.substring(this.length - str.length, this.length) === str;
    }
}
;

var dataDir = __dirname + '/data/';
var postsDir = dataDir + 'posts/';
var draftsDir = dataDir + 'drafts/';
var imagesDir = dataDir + 'images/';

if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir);
}

if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir);
}

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

/*
 * Reads the site config
 */
var fileText = fs.readFileSync(__dirname + '/config.yml', 'utf-8');
var site = yaml.load(fileText);

/*
 * Return Post Data (front-matter and html)
 * Specify data at the top of a .md file and the markdown bellow
 * Based on hexo-front-matter https://github.com/hexojs/hexo-front-matter
 */
function getPostData(filePath, baseUrl) {
    try {
        var fileText = fs.readFileSync(filePath, 'utf-8');
        var match = fileText.match(/^(-{3,})(\n|\r\n)([\s\S]+?)\2\1(?:$|\2([\s\S]*)$)/);
        var frontData = yaml.load(match[3]);
        var tags = frontData.tags.split(",").map(function (s) {
            return s.trim().toLowerCase();
        });
        var html = converter.makeHtml(match[4]);
        var postName = path.basename(filePath, '.md');
        return {
            title: frontData.title,
            subtitle: frontData.subtitle,
            template: frontData.template,
            background: frontData.background,
            date: frontData.date,
            updated: frontData.updated,
            author: frontData.author.toLowerCase(),
            tags: tags,
            html: html,
            name: postName,
            url: baseUrl + postName + '/',
        };
    } catch (e) {
        return null;
    }
}

function getPosts() {
    var files = fs.readdirSync(postsDir);
    var posts = [];
    files.forEach(function (file) {
        var data = getPostData(postsDir + file, '/post/');
        if (data) {
            posts.push(data);
        }
    });
    posts = posts.sort(function (a, b) {
        return b.date - a.date;
    });
    return posts;
}

function getDrafts() {
    var files = fs.readdirSync(draftsDir);
    var drafts = [];
    files.forEach(function (file) {
        var data = getPostData(draftsDir + file, '/draft/');
        if (data) {
            drafts.push(data);
        }
    });
    drafts = drafts.sort(function (a, b) {
        return b.date - a.date;
    });
    return drafts;
}

function getImages() {
    var files = fs.readdirSync(imagesDir);
    var images = [];
    files.forEach(function (file) {
        if (file.endsWith('.jpg') ||
            file.endsWith('.jpeg') ||
            file.endsWith('.png')) {
            var data = {
                name: file,
                url: '/images/' + file
            };
            images.push(data);
        }
    });
    return images;
}

function getGroup(pageId, groups) {
    var pageIndex = pageId - 1;
    var posts = groups[pageIndex] ? groups[pageIndex] : [];
    var previus = groups[pageIndex - 1] ? pageId - 1 : undefined;
    var next = groups[pageIndex + 1] ? pageId + 1 : undefined;
    return {posts: posts, previus: previus, next: next};
}

app.use(express.static(__dirname + '/public'));

app.use('/images', express.static(imagesDir));

app.use(function (req, res, next) {
    res.locals.host = req.protocol + '://' + req.get('host');
    res.locals.site = site;
    next();
});

app.get('/', function (req, res) {
    var page_id = 1;
    var groups = getPosts().chunk(5);
    var group = getGroup(page_id, groups);
    res.render('clean-blog/index.html', {posts: group.posts, previous: group.previus, next: group.next});
});

app.get('/page/:page_id/', function (req, res) {
    var page_id = parseInt(req.params.page_id.trim());
    var groups = getPosts().chunk(5);
    if (page_id <= groups.length) {
        var group = getGroup(page_id, groups);
        res.render('clean-blog/index.html', {posts: group.posts, previous: group.previus, next: group.next});
    } else {
        res.sendStatus(404);
    }
});

app.get('/tag/:tag_name/', function (req, res) {
    var tag_name = req.params.tag_name.trim().toLowerCase();
    var page_id = 1;
    var posts = getPosts().filter(function (data) {
        return data.tags.indexOf(tag_name) >= 0;
    });
    var groups = posts.chunk(5);
    var group = getGroup(page_id, groups);
    res.render('clean-blog/tag.html', {
        tag_name: tag_name,
        tag_size: posts.length,
        posts: group.posts,
        previous: group.previus,
        next: group.next
    });
});

app.get('/tag/:tag_name/page/:page_id/', function (req, res) {
    var tag_name = req.params.tag_name.trim().toLowerCase();
    var page_id = parseInt(req.params.page_id.trim());
    var posts = getPosts().filter(function (data) {
        return data.tags.indexOf(tag_name) >= 0;
    });
    var groups = posts.chunk(5);
    if (page_id <= groups.length) {
        var group = getGroup(page_id, groups);
        res.render('clean-blog/tag.html', {
            tag_name: tag_name,
            tag_size: posts.length,
            posts: group.posts,
            previous: group.previus,
            next: group.next
        });
    } else {
        res.sendStatus(404);
    }
});

app.get('/author/:author_name/', function (req, res) {
    var author_name = req.params.author_name.trim().replace(/\++/g, '\u0020').toLowerCase();
    var page_id = 1;
    var posts = getPosts().filter(function (data) {
        return data.author == author_name;
    });
    var groups = posts.chunk(5);
    var group = getGroup(page_id, groups);
    res.render('clean-blog/author.html', {
        author_name: author_name,
        author_size: posts.length,
        posts: group.posts,
        previous: group.previus,
        next: group.next
    });
});

app.get('/author/:author_name/page/:page_id/', function (req, res) {
    var author_name = req.params.author_name.trim().replace(/\++/g, '\u0020').toLowerCase();
    var page_id = parseInt(req.params.page_id.trim());
    var posts = getPosts().filter(function (data) {
        return data.author == author_name;
    });
    var groups = posts.chunk(5);
    if (page_id <= groups.length) {
        var group = getGroup(page_id, groups);
        res.render('clean-blog/author.html', {
            author_name: author_name,
            author_size: posts.length,
            posts: group.posts,
            previous: group.previus,
            next: group.next
        });
    } else {
        res.sendStatus(404);
    }
});

app.get('/search/:search_name/', function (req, res) {
    var search_name = req.params.search_name.trim().replace(/\++/g, '\u0020').toLowerCase();
    var page_id = 1;
    var posts = getPosts().filter(function (data) {
        var founded = data.title.indexOf(search_name) >= 0;
        founded = founded || data.subtitle.indexOf(search_name) >= 0;
        founded = founded || data.author.indexOf(search_name) >= 0;
        founded = founded || data.html.indexOf(search_name) >= 0;
        founded = founded || data.tags.indexOf(search_name) >= 0;
        return founded;
    });
    var groups = posts.chunk(5);
    var group = getGroup(page_id, groups);
    res.render('clean-blog/search.html', {
        search_name: search_name,
        search_size: posts.length,
        posts: group.posts,
        previous: group.previus,
        next: group.next
    });
});

app.get('/search/:search_name/page/:page_id/', function (req, res) {
    var search_name = req.params.search_name.trim().replace(/\++/g, '\u0020').toLowerCase();
    var page_id = parseInt(req.params.page_id.trim());
    var posts = getPosts().filter(function (data) {
        var founded = data.title.indexOf(search_name) >= 0;
        founded = founded || data.subtitle.indexOf(search_name) >= 0;
        founded = founded || data.author.indexOf(search_name) >= 0;
        founded = founded || data.html.indexOf(search_name) >= 0;
        founded = founded || data.tags.indexOf(search_name) >= 0;
        return founded;
    });
    var groups = posts.chunk(5);
    if (page_id <= groups.length) {
        var group = getGroup(page_id, groups);
        res.render('clean-blog/search.html', {
            search_name: search_name,
            search_size: posts.length,
            posts: group.posts,
            previous: group.previus,
            next: group.next
        });
    } else {
        res.sendStatus(404);
    }
});

app.get('/post/:post_id/', function (req, res) {
    var post_id = req.params.post_id;
    var data = getPostData(postsDir + post_id + '.md', '/post/');
    if (data != null) {
        res.render(data.template, {data: data});
    } else {
        res.sendStatus(404);
    }
});

app.get('/draft/:draft_id/', function (req, res) {
    var draft_id = req.params.draft_id;
    var data = getPostData(draftsDir + draft_id + '.md', '/draft/');
    if (data != null) {
        res.render(data.template, {data: data});
    } else {
        res.sendStatus(404);
    }
});

app.get('/about', function (req, res) {
    res.render('clean-blog/about.html');
});

app.get('/contact', function (req, res) {
    res.render('clean-blog/contact.html');
});

app.post('/contact', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var message = req.body.message;

    var admin = util.format('%s <%s>', site.author, site.email);
    var subject = util.format('Message from %s', name);
    var text = util.format(
        'Name: %s\n' +
        'Email: %s\n' +
        'Cell Phone/WhatsApp: %s\n' +
        'Message: %s',
        name, email, phone, message);
    var html = util.format(
        'Name: %s<br/>\n' +
        'Email: %s<br/>\n' +
        'Cell Phone/WhatsApp: %s<br/>\n' +
        'Message: %s',
        name, email, phone, message);

    transporter.sendMail({
        from: admin,
        to: admin,
        subject: subject,
        html: html,
        text: text
    });

    res.end('Message sended!');
});

/**
 * ssmblog function utils
 */
var utils = {
    getPostData: getPostData,
    getPosts: getPosts,
    getDrafts: getDrafts,
    getGroups: getGroup,
    getImages: getImages,
    postsDir: postsDir,
    draftsDir: draftsDir,
    imagesDir: imagesDir
};

/**
 * ssmblog modules
 */
require(__dirname + "/admin.js")(app, nunjucks, site, utils);

app.get('*', function (req, res) {
    res.sendStatus(404);
});

/*
 * Server
 */
var server = app.listen(8080, '127.0.0.1', function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});