---
title: Frp内网穿透访问远端设备
tags: ["Frp", "内网穿透"]
category: 教程
excerpt: 疫情期间需要远程访问一台远端内网中的树莓派, 恰好手边有一台拥有公网 ip 的华为云 ECS 服务器, 因此可以借助frp轻松解决上述需求, 步骤如下
date: "2022-06-08T00:00:00.000Z"
coverImage: "/assets/articles/frp/cover.png"
author:
  name: WitchElaina
  picture: "/assets/blog/authors/witchelaina.jpeg"
ogImage:
  url: "/assets/articles/frp/cover.png"
---

疫情期间需要远程访问一台远端内网中的树莓派, 恰好手边有一台拥有公网 ip 的华为云 ECS 服务器~~(不是广告)~~, 因此可以借助[frp](https://github.com/fatedier/frp)轻松解决上述需求, 步骤如下

## 配置服务器

将拥有公网 ip 的设备作为`frp`的服务器, 首先下载自己对应 CPU 版本的`frp`

```shell
cd ~
wget https://github.com/fatedier/frp/releases/download/v0.43.0/frp_0.43.0_linux_amd64.tar.gz
```

解压

```shell
tar -zxvf ./frp_0.43.0_linux_amd64.tar.gz
cd frp_0.43.0_linux_amd64
vim ./frps.ini
```

然后编辑配置文件

```shell
[common]
bind_port = 7000    # frps服务运行占用端口
```

之后启动即可

```shell
nohup ./frps -c ./frps.ini &
```

为方便可以编写一个脚本开机自启动服务

```shell
vim start_frps.sh
```

写入以下内容:

```shell
#!/bin/sh
cd ~/frp_0.43.0_linux_amd64.tar.gz
nohup ./frps -c ./frps.ini &
```

保存后执行

```shell
sudo mv ./start_frps.sh /etc/init.d/
```

**注意在云服务器控制台中放行对应端口**, 一定要检查, 否则可能配置失败

## 配置客户端

同样的, 下载可执行文件并解压

```shell
cd ~
wget https://github.com/fatedier/frp/releases/download/v0.43.0/frp_0.43.0_linux_arm64.tar.gz
tar -zxvf ./frp_0.43.0_linux_ard64.tar.gz
cd frp_0.43.0_linux_ard64
vim ./frpc.ini
```

编辑配置文件

```
[common]
server_addr = 120.46.189.52 # 公网IP
server_port = 7000          # frps服务器运行端口

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22             # ssh默认端口
remote_port = 6000          # 转发后ssh端口
```

完成后启动服务即可

```shell
nohup ./frpc -c ./frpc.ini &
```

编写脚本加入启动项

```shell
vim start_frpc.sh
```

写入以下内容:

```shell
#!/bin/sh
cd ~/frp_0.43.0_linux_arm64.tar.gz
nohup ./frpc -c ./frpc.ini &
```

保存后执行

```shell
sudo mv ./start_frpc.sh /etc/init.d/
```

## ssh 连接内网主机

```shell
# ssh -p ${remote_port} ${user_name}@${server_addr}
ssh -p 6000 root@120.46.189.52
```
