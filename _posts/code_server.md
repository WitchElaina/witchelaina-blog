---
title: 从0开始部署VSCode-Server服务
tags: ["Visual Studio Code", "nginx", "后端"]
category: 教程
excerpt: 本教程记录了从0开始架设vscode-server，实现在线vscode服务。
date: "2024-03-16T05:35:07.322Z"
author:
  name: WitchElaina
  picture: "/assets/blog/authors/witchelaina.jpeg"
coverImage: "/assets/articles/code_server/cover.jpg"
ogImage:
  url: "/assets/articles/code_server/cover.jpg"
---

## 前言

code-server 是 VS code 的服务端项目，利用它架设 VS code 服务器后可以在任何设备上通过浏览器使用 VS code，对于有移动端办公等需求的人士十分友好，本文将从选购服务器开始，一步步介绍如何部署 code-server，打造自己的 VS Code 服务器。

## 服务购买

需要清单如下

- 云服务器
- 域名

### 服务器

一般来讲我们只需要一台有公网 IP 的云服务器再加一个域名就行。服务器的话，国内有腾讯云、阿里云、华为云等主机商，国外可选 Vultr，这里个人推荐[Vultr](https://vultr.com/)，价格实惠而且不用域名备案。

配置方面，参考 code-server 的官方建议

> At the minimum, we recommend:
>
> - 1 GB of RAM
> - 2 CPU cores

最少 1GRAM，2 个 CPU 核心。但实测 1vCPU 也完全够用，凭经济实力购买即可。

### 域名

国外有许多购买域名的网站，国内各大主机商也有提供域名服务，按需选择即可。个人使用的是[dynadot](https://www.dynadot.com/zh/)。

#### DNS 解析

无脑选[cloudfare](cloudflare.com/)

## 部署服务

### 域名设置

服务器到手先设置一下防火墙，放通一下`22`， `80`和`443`端口，随后去 cloudfare 中添加一下域名，DNS 中添加一条 A 记录，地址指向服务器的公网 IP，生效后可以试试使用域名 ssh 到服务器，如果能成功登录则说明规则生效，可以进行后续操作。

```
ssh root@your.domain.name
```

### 安装配置 Nginx

以 Ubuntu 为例

```
sudo apt install nginx
```

完成后启动 nginx，此时访问一下你的域名，看到 nginx 欢迎页则说明成功，否则检查一下防火墙配置。

### 安装 code-server

以 ubuntu 安装 4.9.1 版本为例

```
curl -fOL https://github.com/coder/code-server/releases/download/v4.9.1/code-server_4.9.1_amd64.deb
sudo dpkg -i code-server_4.9.1_amd64.deb
sudo systemctl enable --now code-server@root
## Now visit http://127.0.0.1:8080. Your password is in ~/.config/code-server/config.yaml
```

完成后可以前往` ~/.config/code-server/config.yaml`配置，主要修改一下连接密码，必要时也可以修改端口

### 申请 HTTPS 证书

推荐使用 certbot，访问官网，选择你的系统版本和代理软件，根据教程操作，安装完成后使用`sudo certbot certonly --nginx`进行证书申请，完成后会得到类似下列信息

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/your.domain.name/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/your.domain.name/privkey.pem
   Your certificate will expire on 2023-04-10. To obtain a new or
   tweaked version of this certificate in the future, simply run
   certbot again. To non-interactively renew *all* of your
   certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

记住上述两个路径

```
/etc/letsencrypt/live/your.domain.name/fullchain.pem

/etc/letsencrypt/live/your.domain.name/privkey.pem
```

随后前往修改 nginx 配置，如果你不会且只想运行一个 codeserver 服务，照抄以下代码就行。

```
events {}

http {
    server {
        listen 443 ssl;
        server_name your.domain.name;  ## 替换成你的域名
        ssl_certificate /etc/letsencrypt/live/your.domain.name/fullchain.pem; ## 刚刚记录的路径
        ssl_certificate_key /etc/letsencrypt/live/your.domain.name/privkey.pem; ## 刚刚记录的路径
        location / {
          proxy_pass http://localhost:8080/; ## 默认运行在8080端口，如有修改需要在此处同步修改
          proxy_set_header Host $host;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection upgrade;
          proxy_set_header Accept-Encoding gzip;
        }
    }
}
```

都完成后重启一下服务

```
sudo systemctl restart code-server@root
sudo nginx -s reload
```

此时访问你的域名，就可以成功连接到 code-server 了。
