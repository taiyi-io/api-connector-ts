#!/bin/bash

# 解析参数
SERVER_ADDR=$1
PORT=${2:-22}

# 检查服务器地址
if [ -z "$SERVER_ADDR" ]; then
    read -p "请输入服务器地址: " SERVER_ADDR
    if [ -z "$SERVER_ADDR" ]; then
        echo "服务器地址不能为空，脚本结束。"
        exit 1
    fi
fi

echo "开始部署到服务器: $SERVER_ADDR:$PORT"

# 1. 使用 pnpm build 确认版本无错
echo "正在构建项目..."
pnpm build
if [ $? -ne 0 ]; then
    echo "构建出错，请检查错误信息。"
    exit 1
fi

# 2. 调用 gendoc.sh，生成文档
echo "正在生成文档..."
./gendoc.sh
if [ $? -ne 0 ]; then
    echo "文档生成出错，请检查错误信息。"
    exit 1
fi

# 检查文档包是否存在
if [ ! -f "api_docs.tar.gz" ]; then
    echo "api_docs.tar.gz 文件不存在，无法继续部署。"
    exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 3. 远程服务器 /opt/taiyi/api_ts/docs 路径备份为 docs_{timestamp}.tar.gz
echo "正在备份远程服务器文档..."
ssh -p $PORT root@$SERVER_ADDR "cd /opt/taiyi/api_ts && if [ -d 'docs' ]; then tar -zcvf docs_${TIMESTAMP}.tar.gz docs; fi"
if [ $? -ne 0 ]; then
    echo "备份出错，请检查错误信息。"
    exit 1
fi

# 4. 生成文档包复制到 /opt/taiyi/api_ts，解压缩，成功后删除文档包，提示内容已更新
echo "正在上传文档包..."
scp -P $PORT api_docs.tar.gz root@$SERVER_ADDR:/opt/taiyi/api_ts/
if [ $? -ne 0 ]; then
    echo "上传出错，请检查错误信息。"
    exit 1
fi

echo "正在远程解压文档包..."
ssh -p $PORT root@$SERVER_ADDR "cd /opt/taiyi/api_ts && rm -rf docs && tar -zxvf api_docs.tar.gz && rm -f api_docs.tar.gz"
if [ $? -ne 0 ]; then
    echo "解压出错，请检查错误信息。"
    exit 1
fi

echo "内容已更新，部署完成！"
