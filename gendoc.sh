#!/bin/bash
npx typedoc
if [ $? -ne 0 ]; then
    echo "文档生成出错，请检查错误信息。"
    exit 1
else
    echo "文档生成完成"
fi
