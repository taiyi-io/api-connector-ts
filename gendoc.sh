#!/bin/bash
npx typedoc
if [ $? -ne 0 ]; then
    echo "文档生成出错，请检查错误信息。"
    exit 1
else
    echo "文档生成完成"
    # 检查 api_docs.tar.gz 是否存在，若存在则删除
    if [ -f "api_docs.tar.gz" ]; then
        rm api_docs.tar.gz
    fi
    # 将 docs 目录打包为 api_docs.tar.gz
    tar -zcvf api_docs.tar.gz docs
    echo "文档打包完成"
fi
