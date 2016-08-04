/*!
 * ssmblog Super Simple Markdown Blog
 * Admin module
 * https://github.com/jfmedeirosneto/ssmblog
 * Copyright(c) 2016 João Neto <jfmedeirosneto@yahoo.com.br>
 */

'use strict';

module.exports = function (app, site, utils) {

    var uploadDir = __dirname + '/uploads/';
    var multer  = require('multer');
    var upload = multer({ dest: uploadDir });

    var fs = require('fs');
    var fse = require('fs-extra');

    // Authentication and Authorization Middleware
    var auth = function(req, res, next) {
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
        } else if(user === site.user && password === site.password) {
            req.session.user = site.user;
            req.session.admin = true;
            if( redirect ) {
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

    app.get('/admin/posts', auth, function (req, res) {
        var posts = utils.getPosts();
        res.render('simple-sidebar/posts.html', {posts: posts});
    });

    app.post('/admin/post/upload', auth, upload.single('newPost'), function (req, res) {
        var file = req.file;
        if( file.originalname.endsWith('.md') ) {
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

    app.post('/admin/draft/upload', auth, upload.single('newDraft'), function (req, res) {
        var file = req.file;
        if( file.originalname.endsWith('.md') ) {
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
};
