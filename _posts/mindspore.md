---
title: macOS下安装华为Mindspore框架
tags: ["macOS", "Mindspore", "Docker"]
category: 教程
date: "2022-05-10T01:46:51.000Z"
excerpt: 本篇教程将讲解如何在macOS下使用Docker安装特定版本的Mindspore容器
author:
  name: WitchElaina
  picture: "/assets/blog/authors/witchelaina.jpeg"
coverImage: "/assets/articles/mindspore/cover.png"
ogImage:
  url: "/assets/articles/mindspore/cover.png"
---

人工智能课程要求使用`Mindspore 1.3.0`完成一些实验, 但是官方没有提供 macOS 的版本, 我思考后决定使用`Docker`搭建相关环境

## 安装 Docker

前往[Docker 官网](https://www.docker.com/get-started/)下载对应版本的桌面应用

安装完成后点击菜单栏的`Dokcer图标->Dashboard->Sign In`完成登录

随后打开`Terminal`检测`docker`是否已被添加到环境变量

```sh
❯ docker -v
Docker version 20.10.14, build a224086
```

如正确显示版本则说明成功

## 安装 Mindspore

打开终端, 输入

```bash
docker pull swr.cn-south-1.myhuaweicloud.com/mindspore/mindspore-cpu:1.3.0
```

完成后使用以下命令启动容器

```bash
docker run -it swr.cn-south-1.myhuaweicloud.com/mindspore/mindspore-cpu:1.3.0 /bin/bash
```

按照上述步骤进入 MindSpore 容器后，测试 Docker 是否正常工作，请运行下面的 Python 代码并检查输出：

```bash
python -c "import mindspore;mindspore.run_check()"
```

如果输出：

```text
mindspore version: 版本号
The result of multiplication calculation is correct, MindSpore has been installed successfully!
```

至此，你已经成功通过 Docker 方式安装了 MindSpore CPU 版本。

这里我演示的是`1.3.0`版本的 Mindspore, 如果想安装其他版本, 只需要将上述命令中的`1.3.0`改成对应版本即可, 具体参数说明如下, 更多请参考[官方文档](https://gitee.com/mindspore/docs/blob/r1.3/install/mindspore_cpu_install_docker.md)

| 硬件平台 | Docker 镜像仓库           | 标签      | 说明                                                                                               |
| :------- | :------------------------ | :-------- | :------------------------------------------------------------------------------------------------- |
| CPU      | `mindspore/mindspore-cpu` | `x.y.z`   | 已经预安装 MindSpore `x.y.z` CPU 版本的生产环境。                                                  |
|          |                           | `devel`   | 提供开发环境从源头构建 MindSpore（`CPU`后端）。安装详情请参考<https://www.mindspore.cn/install> 。 |
|          |                           | `runtime` | 提供运行时环境，未安装 MindSpore 二进制包（`CPU`后端）。                                           |

> `x.y.z`对应 MindSpore 版本号，例如安装 1.1.0 版本 MindSpore 时，`x.y.z`应写为 1.1.0。
