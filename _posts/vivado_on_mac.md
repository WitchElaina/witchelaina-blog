---
title: 如何在mac上优雅地使用Vivado
tags: ["macOS", "Vivado", "Docker"]
category: 教程
date: "2022-10-13T13:02:24.000Z"
excerpt: 最近计组实验需要频繁使用vivado, 但是Xilinx没有开发macOS版本的, 一般解决方案是使用虚拟机或Bootcamp, 但过于臃肿, 我们可以借助Docker与Xquartz优雅地在macOS上搭建环境.
author:
  name: WitchElaina
  picture: "/assets/blog/authors/witchelaina.jpeg"
coverImage: "/assets/articles/vivado_mac/cover.webp"
ogImage:
  url: "/assets/articles/vivado_mac/cover.webp"
---

## 前言

最近计组实验需要频繁使用 vivado, 但是 Xilinx 没有开发 macOS 版本的, 一般解决方案是使用虚拟机或 Bootcamp, 但过于臃肿, 我们可以借助 Docker 与 Xquartz 优雅地在 macOS 上搭建环境。

### Docker

Docker 想必不用做过多介绍，可谓是虚拟机的一个可行、经济且高效的替代方案，具体可以前往[Docker 官网](https://docs.docker.com/)了解。

### Xquartz

[Xquartz](https://www.xquartz.org/index.html)是 mac 上的 X11.app，利用其 X11 Forwarding 技术，将宿主机（也就是我们的 mac）作为 X server，将 docker 容器中的 GUI 程序（Vivado）作为 X client 访问 X server，以实现在 macOS 上操作相应 GUI 程序。

这个过程有点类似于 VNC，可以理解成单个 GUI 的 VNC。

### Vivado

不想过多介绍，只想说~~Fxxk you, Xilinx~~

## 准备工作

### Xquartz

使用`Homebrew`包管理器安装，打开终端输入：

```shell
brew install --cask xquartz
```

完成后重启电脑，然后打开 Xquartz（如找不到直接 Spotlight 搜索就行），按`cmd`+`,`进入偏好设置，在安全性中将第二个选项选中，即允许来自网络的连接。

### Vivado

我们需要下载完整的 Linux Vivado 安装包，可以前往[Xilinx 官网](https://www.xilinx.com/support/download.html)下载。

建议下载到`~/Downloads/`路径下，这样之后运行 docker 时可以直接使用本文提供的指令

### Docker

可以使用`Homebrew`包管理器安装 Docker

```shell
brew install docker
```

或者直接安装有图形化界面的 Docker Desktop，个人推荐这一种，毕竟有图形界面为什么不用呢

访问[Docker 官网](https://www.docker.com/)下载安装即可

## 实例化 Docker 容器

首先拉取一下 Ubuntu 的镜像，当然你也可以使用其他 Vivado 支持的 Linux 发行版

```shell
docker pull ubuntu
```

然后我们需要查看一下本机的 IP 地址，打开设置->共享->文件共享，可以看到小字中有`smb://xxx.xxx.xxx.xxx`格式的地址，将`smb://`后面的部分记录一下

完成后我们实例化这个镜像，创建一个文件夹存放下载好的安装包，然后挂载到容器中

```shell
## macOS

## 创建挂载文件夹并解压安装包
cd ~
mkdir vivado-dir
mv ~/Downloads/Xilinx_Vivado_SDK_2018.3_1207_2324.tar ~/vivado-dir/
cd vivado-dir
tar -zxvf ./Xilinx_Vivado_SDK_2018.3_1207_2324.tar
rm -rf ./Xilinx_Vivado_SDK_2018.3_1207_2324.tar

## 实例化docker镜像
docker run --name vivado \                            ## 容器名称
  --mount source=~/vivado-dir,target=/vivado \        ## 挂载文件夹到容器的/vivado目录下
  -e DISPLAY=xxx.xxx.xxx.xxx:0 \                      ## 将xxx.xxx.xxx.xxx替换成你刚刚得到的IP地址
  -i -t ubuntu bash
```

接下来运行 docker 容器

```shell
docker exec vivado /bin/bash
```

## 配置 X11 环境

进入容器后安装一下依赖，如下载慢请自行使用网络代理或换源

```shell
apt -y --no-install-recommends install ca-certificates curl sudo xorg dbus dbus-x11 ubuntu-gnome-default-settings gtk2-engines lxappearance
```

## 安装 Vivado

以上工作都完成后，我们进入刚刚挂载的目录，运行 Vivado 安装程序，准确无误的话会在 mac 中显示出安装程序的窗口

```shell
## docker
cd /vivado/Xilinx_Vivado_SDK_2018.3_1207_2324
sudo ./xsetup
```

显示出图形界面后安装即可

安装程序默认会将 vivado 安装在`/tools/Xilinx`目录下，运行完成后，可以将 Vivado 添加到环境变量。

## 运行 Vivado

启动的一般步骤为，运行 docker 容器

```
docker exec vivado /bin/bash
```

运行 Vivado

```
vivado
```

## 总结

至此安装已全部完成，你可以扔掉臃肿的虚拟机，优雅地在 macOS 中使用 vivado。

![Prev](/assets/articles/vivado_mac/cover.webp)
