/*!
 * ssmblog Super Simple Markdown Blog
 * Admin module
 * https://github.com/jfmedeirosneto/ssmblog
 * Copyright(c) 2016 João Neto <jfmedeirosneto@yahoo.com.br>
 */

'use strict';

module.exports = function (app, nunjucks, site, utils) {

    var uploadDir = __dirname + '/uploads/';
    var multer = require('multer');
    var upload = multer({dest: uploadDir});
    var moment = require('moment');

    var fs = require('fs');
    var fse = require('fs-extra');

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return str.length > 0 && this.substring(0, str.length) === str;
        };
    }

    if (typeof String.prototype.endsWith != 'function') {
        String.prototype.endsWith = function (str) {
            return str.length > 0 && this.substring(this.length - str.length, this.length) === str;
        };
    }

    // Authentication and Authorization Middleware
    var auth = function (req, res, next) {
        if (req.session && req.session.user === site.user && req.session.admin) {
            return next();
        } else {
            var redirect = req.protocol + '://' + req.get('host') + req.url;
            return res.redirect("/admin/login?redirect=" + redirect);
        }
    };

    app.get('/admin/login', function (req, res) {
        var redirect = req.query.redirect || '';
        res.render('simple-sidebar/login.html', {redirect: redirect});
    });

    app.post('/admin/login', function (req, res) {
        var user = req.body.user;
        var password = req.body.password;
        var redirect = req.body.redirect;
        if (!user || !password) {
            return res.redirect("/admin/login");
        } else if (user === site.user && password === site.password) {
            req.session.user = site.user;
            req.session.admin = true;
            if (redirect) {
                return res.redirect(redirect);
            } else {
                return res.redirect("/admin");
            }
        }
        return res.redirect("/admin/login");
    });

    app.get('/admin/logout', function (req, res) {
        req.session.destroy();
        return res.redirect("/admin");
    });

    app.get('/admin', auth, function (req, res) {
        return res.redirect("/admin/posts");
    });

    app.get('/admin/env', auth, function (req, res) {
        var content = '<pre>Node Version: ' + process.version + '\n\nenv: {\n\n';
        for (var k in process.env) {
            content += '   ' + k + ': ' + process.env[k] + '\n';
        }
        content += '\n}\n</pre><br/>\n'
        res.render('simple-sidebar/env.html', {content: content});
    });

    app.get('/admin/posts', auth, function (req, res) {
        var posts = utils.getPosts();
        res.render('simple-sidebar/posts.html', {posts: posts});
    });

    app.get('/admin/post/template', auth, function (req, res) {
        var day = moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SS Z');
        var data = nunjucks.render('template.md', {site: site, date: day});
        var template = __dirname + '/downloads/post.md';
        fs.writeFileSync(template, data);
        res.download(template);
    });

    app.post('/admin/post/upload', auth, upload.single('newPost'), function (req, res) {
        var file = req.file;
        if (file.originalname.endsWith('.md')) {
            fse.copySync(uploadDir + file.filename, utils.postsDir + file.originalname);
            fse.removeSync(uploadDir + file.filename);
        }
        var posts = utils.getPosts();
        res.render('simple-sidebar/posts.html', {posts: posts});
    });

    app.get('/admin/post/:post_id/delete/', auth, function (req, res) {
        var post_id = req.params.post_id;
        fse.removeSync(utils.postsDir + post_id + '.md');
        var posts = utils.getPosts();
        res.render('simple-sidebar/posts.html', {posts: posts});
    });

    app.get('/admin/post/:post_id/download/', auth, function (req, res) {
        var post_id = req.params.post_id;
        res.download(utils.postsDir + post_id + '.md');
    });

    app.get('/admin/drafts', auth, function (req, res) {
        var drafts = utils.getDrafts();
        res.render('simple-sidebar/drafts.html', {drafts: drafts});
    });

    app.get('/admin/draft/template', auth, function (req, res) {
        var day = moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SS Z');
        var data = nunjucks.render('template.md', {site: site, date: day});
        var template = __dirname + '/downloads/draft.md';
        fs.writeFileSync(template, data);
        res.download(template);
    });

    app.post('/admin/draft/upload', auth, upload.single('newDraft'), function (req, res) {
        var file = req.file;
        if (file.originalname.endsWith('.md')) {
            fse.copySync(uploadDir + file.filename, utils.draftsDir + file.originalname);
            fse.removeSync(uploadDir + file.filename);
        }
        var drafts = utils.getDrafts();
        res.render('simple-sidebar/drafts.html', {drafts: drafts});
    });

    app.get('/admin/draft/:draft_id/delete/', auth, function (req, res) {
        var draft_id = req.params.draft_id;
        fse.removeSync(utils.draftsDir + draft_id + '.md');
        var drafts = utils.getDrafts();
        res.render('simple-sidebar/drafts.html', {drafts: drafts});
    });

    app.get('/admin/draft/:draft_id/download/', auth, function (req, res) {
        var draft_id = req.params.draft_id;
        res.download(utils.draftsDir + draft_id + '.md');
    });

    app.get('/admin/draft/:draft_id/publish/', auth, function (req, res) {
        var draft_id = req.params.draft_id;
        fse.copySync(utils.draftsDir + draft_id + '.md', utils.postsDir + draft_id + '.md');
        var posts = utils.getPosts();
        res.render('simple-sidebar/posts.html', {posts: posts});
    });

    app.get('/admin/images', auth, function (req, res) {
        var images = utils.getImages();
        res.render('simple-sidebar/images.html', {images: images});
    });

    app.post('/admin/image/upload', auth, upload.single('newImage'), function (req, res) {
        var file = req.file;
        if (file.originalname) {
            if (file.originalname.endsWith('.jpg') ||
                file.originalname.endsWith('.jpeg') ||
                file.originalname.endsWith('.png')) {
                fse.copySync(uploadDir + file.filename, utils.imagesDir + file.originalname);
                fse.removeSync(uploadDir + file.filename);
            }
        }
        var images = utils.getImages();
        res.render('simple-sidebar/images.html', {images: images});
    });

    app.get('/admin/image/:image_id/delete/', auth, function (req, res) {
        var image_id = req.params.image_id;
        fse.removeSync(utils.imagesDir + image_id);
        var images = utils.getImages();
        res.render('simple-sidebar/images.html', {images: images});
    });

    app.get('/admin/image/:image_id/download/', auth, function (req, res) {
        var image_id = req.params.image_id;
        res.download(utils.imagesDir + image_id);
    });
};
