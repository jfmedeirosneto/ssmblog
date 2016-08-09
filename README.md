# ssmblog

Super Simple Markdown Blog is a small blog system to write posts in Markdown markup language.

Copyright(c) 2016 João Neto <<jfmedeirosneto@yahoo.com.br>>

## Features

- Posts stored in ".md" files
- No database required
- List of posts by tag and author
- Search in posts
- About page
- Contact page
- Admin page
- Node.js powered
- Bootstrap blog template

## Run ssmblog

Clone or download the ssmblog from github to a directory
Open prompt in this directory

``` bash
$ npm install
$ node index.js
```

Open an internet browser in correspondent main page
When running in local mode the main page is http://localhost:8080/

## Write blog posts

Create a ".md" file in posts folder (ex. hello-world.md)
The name of file is the name of the post
Edit the post according to example bellow

``` markdown
---
title: "Post Title"
subtitle: "Post Subtitle"
template: "clean-blog/post.html"
background: "clean-blog/img/post-bg.jpg"
date: 2016-07-21 12:01:00.00 -3
updated: 2016-07-21 12:01:00.00 -3
author: "Post Author"
tags: "tag1,tag2"
---
Post contents section, write in this section all post text in Markdown markup language.
```

The url of post is http://localhost:8080/post/hello-world/
All posts is ordering by ascending date in home, tag, author and search pages

The posts created in drafts directory is only acessible by draft url like http://localhost:8080/drafts/hello-world/

## Admin page

When use ssmblog is possible to admin posts and drafts by Admin page.
When running in local mode the Admin page is http://localhost:8080/admin

## Tips

- To correct delivery the emails of Contact page check the documentation of [Nodemailer](http://nodemailer.com/) and adjust the transporter variable in index.js file
- To change the contents of About page edit the about.md file in views\clean-blog directory
- To change the global config of blog edit the config.yml file in main directory
- Set new secret on express-session middleware options

## Screenshots

### Home Page
![Home](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/home.png "Home")

### Post Page
![Post](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/post.png "Post")

### About Page
![About](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/about.png "About")

### Contact Page
![Contact](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/contact.png "Contact")

### Search Page
![Search](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/search.png "Search")

### Search Results Page
![Search Results](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/search-results.png "Search Results")

### Tag Page
![Tag](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/tag.png "Tag")

### Author Page
![Author](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/author.png "Author")

### Admin Posts Page
![Admin Posts Page](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/admin-posts.png "Admin Posts Page")

### Admin Drafts Page
![Admin Drafts Page](https://raw.githubusercontent.com/jfmedeirosneto/ssmblog/master/img/admin-drafts.png "Admin Drafts Page")

## Credits

- Theme by [Start Bootstrap](http://startbootstrap.com/template-overviews/clean-blog/)
- Concept based in [Hexo blog framework](https://github.com/hexojs/hexo), but with much fewer resources
- [Node.js](https://nodejs.org)

## License

GNU GPLv3
