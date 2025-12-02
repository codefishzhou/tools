// ==UserScript==
// @name         CSS 转 Tailwind 实时转换器
// @namespace    http://tampermonkey.net/
// @version      2025-12-02
// @description  将 CSS 样式实时转换为 Tailwind CSS 类名
// @author       You
// @match        https://codesign.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://unpkg.com/css-to-tailwind-translator@1.2.8/dist/browser-bundle.iife.js
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // 添加自定义样式
    GM_addStyle(`
        #css-tw-converter {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            background: #1e1e2e;
            border: 1px solid #313244;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 0;
            box-sizing: border-box;
            color: #cdd6f4;
        }
        #css-tw-converter .header {
            background: linear-gradient(135deg, #89b4fa 0%, #cba6f7 100%);
            color: #1e1e2e;
            padding: 12px 16px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 14px;
            cursor: move;
        }
        #css-tw-converter .header-title {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #css-tw-converter .header-title::before {
            content: '🎨';
        }
        #css-tw-converter .close-btn {
            cursor: pointer;
            background: rgba(0,0,0,0.2);
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 12px;
            color: #1e1e2e;
            font-weight: 500;
            transition: background 0.2s;
        }
        #css-tw-converter .close-btn:hover {
            background: rgba(0,0,0,0.3);
        }
        #css-tw-converter .content {
            padding: 16px;
        }
        #css-tw-converter label {
            display: block;
            font-size: 12px;
            color: #a6adc8;
            margin-bottom: 6px;
            font-weight: 500;
        }
        #css-tw-converter textarea {
            width: 100%;
            height: 120px;
            margin-bottom: 12px;
            padding: 12px;
            border: 1px solid #313244;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            font-size: 13px;
            resize: vertical;
            box-sizing: border-box;
            background: #181825;
            color: #cdd6f4;
            transition: border-color 0.2s;
        }
        #css-tw-converter textarea:focus {
            outline: none;
            border-color: #89b4fa;
        }
        #css-tw-converter textarea::placeholder {
            color: #6c7086;
        }
        #css-tw-converter .input-wrapper,
        #css-tw-converter .output-wrapper {
            position: relative;
        }
        #css-tw-converter #tailwind-output {
            background: #11111b;
            color: #a6e3a1;
        }
        #css-tw-converter .btn-row {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }
        #css-tw-converter .action-btn {
            flex: 1;
            background: #89b4fa;
            color: #1e1e2e;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }
        #css-tw-converter .action-btn:hover {
            background: #b4befe;
            transform: translateY(-1px);
        }
        #css-tw-converter .clear-btn {
            background: #45475a;
        }
        #css-tw-converter .clear-btn:hover {
            background: #585b70;
        }
        #css-tw-converter .status {
            font-size: 12px;
            color: #6c7086;
            text-align: center;
            min-height: 18px;
            padding: 8px 0 0;
            border-top: 1px solid #313244;
            margin-top: 4px;
        }
        #css-tw-converter .status.success {
            color: #a6e3a1;
        }
        #css-tw-converter .status.error {
            color: #f38ba8;
        }
        #tw-toggle-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #89b4fa 0%, #cba6f7 100%);
            color: #1e1e2e;
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            font-size: 20px;
            cursor: pointer;
            z-index: 999998;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            display: none;
        }
        #tw-toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        }
    `);

    // 创建转换器界面
    const converterHTML = `
        <button class="toggle-btn" id="tw-toggle-btn">🎨</button>
        <div id="css-tw-converter">
            <div class="header" id="tw-header">
                <span class="header-title">CSS → Tailwind 转换器</span>
                <button class="close-btn" id="tw-close-btn">收起</button>
            </div>
            <div class="content">
                <div class="input-wrapper">
                    <label for="css-input">输入 CSS 样式：</label>
                    <textarea id="css-input" placeholder="粘贴 CSS 代码，例如：&#10;margin: 16px;&#10;padding: 12px 24px;&#10;display: flex;&#10;justify-content: center;"></textarea>
                </div>
                <div class="output-wrapper">
                    <label for="tailwind-output">Tailwind 类名：</label>
                    <textarea id="tailwind-output" placeholder="转换结果将显示在这里..." readonly></textarea>
                </div>
                <div class="btn-row">
                    <button class="action-btn clear-btn" id="clear-btn">🗑️ 清空</button>
                    <button class="action-btn" id="manual-copy">📋 复制结果</button>
                </div>
                <div class="status" id="status">输入 CSS 后自动转换并复制到剪贴板</div>
            </div>
        </div>
    `;

    // 将界面添加到页面
    const container = document.createElement('div');
    container.innerHTML = converterHTML;
    document.body.appendChild(container);

    // 获取DOM元素
    const converterEl = document.getElementById('css-tw-converter');
    const cssInput = document.getElementById('css-input');
    const tailwindOutput = document.getElementById('tailwind-output');
    const statusEl = document.getElementById('status');
    const closeBtn = document.getElementById('tw-close-btn');
    const toggleBtn = document.getElementById('tw-toggle-btn');
    const manualCopyBtn = document.getElementById('manual-copy');
    const header = document.getElementById('tw-header');

    // 拖拽功能
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target === closeBtn) return;
        isDragging = true;
        const rect = converterEl.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        converterEl.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;
        converterEl.style.left = x + 'px';
        converterEl.style.top = y + 'px';
        converterEl.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        converterEl.style.transition = '';
    });

    // 关闭/显示按钮功能
    closeBtn.addEventListener('click', () => {
        converterEl.style.display = 'none';
        toggleBtn.style.display = 'block';
    });

    toggleBtn.addEventListener('click', () => {
        converterEl.style.display = 'block';
        toggleBtn.style.display = 'none';
    });

    // 复制到剪贴板
    function copyToClipboard(text) {
        // 优先使用 GM_setClipboard（更可靠）
        if (typeof GM_setClipboard !== 'undefined') {
            GM_setClipboard(text, 'text');
            return Promise.resolve();
        }
        // 降级使用 navigator.clipboard
        return navigator.clipboard.writeText(text);
    }

    // 手动复制按钮功能
    manualCopyBtn.addEventListener('click', async () => {
        const text = tailwindOutput.value;
        if (!text.trim()) {
            showStatus('没有可复制的内容', 'error');
            return;
        }
        try {
            await copyToClipboard(text);
            showStatus('✓ 已复制到剪贴板！', 'success');
        } catch (err) {
            showStatus('复制失败，请手动选择复制', 'error');
        }
    });

    // 显示状态信息
    function showStatus(message, type = 'info') {
        statusEl.textContent = message;
        statusEl.className = 'status' + (type !== 'info' ? ' ' + type : '');
        if (type === 'success') {
            setTimeout(() => {
                statusEl.textContent = '输入 CSS 后自动转换并复制到剪贴板';
                statusEl.className = 'status';
            }, 2000);
        }
    }

    // 核心转换函数 - 使用 css-to-tailwind-translator 库
    function convertCSStoTailwind(cssText) {
        if (!cssText.trim()) {
            return '';
        }

        try {
            // 检查库是否加载成功
            if (typeof CssToTailwindTranslator === 'undefined') {
                console.error('css-to-tailwind-translator 库未加载');
                return fallbackConvert(cssText);
            }

            // 将纯样式文本包装成有效的 CSS 规则
            let cssRule = cssText.trim();
            
            // 如果输入不包含选择器，自动包装
            if (!cssRule.includes('{')) {
                cssRule = `.temp { ${cssRule} }`;
            }

            // 使用库进行转换
            const result = CssToTailwindTranslator(cssRule);
            
            if (result && result.data && result.data.length > 0) {
                // 提取所有转换结果的 Tailwind 类名
                const classes = result.data
                    .map(item => item.resultVal)
                    .filter(val => val && val.trim())
                    .join(' ');
                return classes;
            }

            // 如果库转换失败，使用备用方案
            return fallbackConvert(cssText);

        } catch (error) {
            console.error('转换错误:', error);
            return fallbackConvert(cssText);
        }
    }

    // 备用转换函数 - 更完整的映射
    function fallbackConvert(cssText) {
        const rules = cssText.split(';').filter(rule => rule.trim());
        const tailwindClasses = [];

        // 数值转 Tailwind 的辅助函数 - 保留 px 单位
        function pxToTw(value, prefix) {
            const num = parseFloat(value);
            if (isNaN(num)) return null;
            
            // 0 特殊处理
            if (num === 0) {
                return `${prefix}-0`;
            }
            
            // 其他数值都使用任意值语法，保留 px 单位
            return `${prefix}-[${num}px]`;
        }

        // 颜色转换辅助函数
        function colorToTw(value, prefix) {
            const colorMap = {
                'transparent': 'transparent',
                'black': 'black', '#000': 'black', '#000000': 'black',
                'white': 'white', '#fff': 'white', '#ffffff': 'white',
                '#333': 'gray-700', '#333333': 'gray-700',
                '#666': 'gray-500', '#666666': 'gray-500',
                '#999': 'gray-400', '#999999': 'gray-400',
                '#f5f5f5': 'gray-100', '#e5e5e5': 'gray-200',
                '#d4d4d4': 'gray-300', '#a3a3a3': 'gray-400',
            };
            
            const lowerValue = value.toLowerCase();
            if (colorMap[lowerValue]) {
                return `${prefix}-${colorMap[lowerValue]}`;
            }
            // 使用任意值
            return `${prefix}-[${value}]`;
        }

        rules.forEach(rule => {
            const colonIndex = rule.indexOf(':');
            if (colonIndex === -1) return;
            
            const property = rule.slice(0, colonIndex).trim().toLowerCase();
            const value = rule.slice(colonIndex + 1).trim();
            if (!property || !value) return;

            let twClass = null;

            switch (property) {
                // Display
                case 'display':
                    const displayMap = {
                        'flex': 'flex', 'inline-flex': 'inline-flex',
                        'grid': 'grid', 'inline-grid': 'inline-grid',
                        'block': 'block', 'inline-block': 'inline-block',
                        'inline': 'inline', 'none': 'hidden',
                        'contents': 'contents', 'flow-root': 'flow-root'
                    };
                    twClass = displayMap[value];
                    break;

                // Flexbox
                case 'flex-direction':
                    const flexDirMap = {
                        'row': 'flex-row', 'row-reverse': 'flex-row-reverse',
                        'column': 'flex-col', 'column-reverse': 'flex-col-reverse'
                    };
                    twClass = flexDirMap[value];
                    break;

                case 'flex-wrap':
                    const flexWrapMap = {
                        'wrap': 'flex-wrap', 'nowrap': 'flex-nowrap',
                        'wrap-reverse': 'flex-wrap-reverse'
                    };
                    twClass = flexWrapMap[value];
                    break;

                case 'justify-content':
                    const justifyMap = {
                        'flex-start': 'justify-start', 'start': 'justify-start',
                        'flex-end': 'justify-end', 'end': 'justify-end',
                        'center': 'justify-center',
                        'space-between': 'justify-between',
                        'space-around': 'justify-around',
                        'space-evenly': 'justify-evenly'
                    };
                    twClass = justifyMap[value];
                    break;

                case 'align-items':
                    const alignItemsMap = {
                        'flex-start': 'items-start', 'start': 'items-start',
                        'flex-end': 'items-end', 'end': 'items-end',
                        'center': 'items-center',
                        'baseline': 'items-baseline',
                        'stretch': 'items-stretch'
                    };
                    twClass = alignItemsMap[value];
                    break;

                case 'align-self':
                    const alignSelfMap = {
                        'auto': 'self-auto',
                        'flex-start': 'self-start', 'start': 'self-start',
                        'flex-end': 'self-end', 'end': 'self-end',
                        'center': 'self-center',
                        'stretch': 'self-stretch',
                        'baseline': 'self-baseline'
                    };
                    twClass = alignSelfMap[value];
                    break;

                case 'flex':
                    if (value === '1' || value === '1 1 0%') twClass = 'flex-1';
                    else if (value === 'auto' || value === '1 1 auto') twClass = 'flex-auto';
                    else if (value === 'initial' || value === '0 1 auto') twClass = 'flex-initial';
                    else if (value === 'none' || value === '0 0 auto') twClass = 'flex-none';
                    else twClass = `flex-[${value.replace(/\s+/g, '_')}]`;
                    break;

                case 'flex-grow':
                    twClass = value === '0' ? 'grow-0' : value === '1' ? 'grow' : `grow-[${value}]`;
                    break;

                case 'flex-shrink':
                    twClass = value === '0' ? 'shrink-0' : value === '1' ? 'shrink' : `shrink-[${value}]`;
                    break;

                case 'gap':
                    if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'gap');
                    else twClass = `gap-[${value}]`;
                    break;

                case 'row-gap':
                    if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'gap-y');
                    else twClass = `gap-y-[${value}]`;
                    break;

                case 'column-gap':
                    if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'gap-x');
                    else twClass = `gap-x-[${value}]`;
                    break;

                // Spacing - Margin
                case 'margin':
                    if (value === '0' || value === '0px') twClass = 'm-0';
                    else if (value === 'auto') twClass = 'm-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'm');
                    else twClass = `m-[${value}]`;
                    break;

                case 'margin-top':
                    if (value === '0' || value === '0px') twClass = 'mt-0';
                    else if (value === 'auto') twClass = 'mt-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'mt');
                    else twClass = `mt-[${value}]`;
                    break;

                case 'margin-right':
                    if (value === '0' || value === '0px') twClass = 'mr-0';
                    else if (value === 'auto') twClass = 'mr-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'mr');
                    else twClass = `mr-[${value}]`;
                    break;

                case 'margin-bottom':
                    if (value === '0' || value === '0px') twClass = 'mb-0';
                    else if (value === 'auto') twClass = 'mb-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'mb');
                    else twClass = `mb-[${value}]`;
                    break;

                case 'margin-left':
                    if (value === '0' || value === '0px') twClass = 'ml-0';
                    else if (value === 'auto') twClass = 'ml-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'ml');
                    else twClass = `ml-[${value}]`;
                    break;

                // Spacing - Padding
                case 'padding':
                    if (value === '0' || value === '0px') twClass = 'p-0';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'p');
                    else twClass = `p-[${value}]`;
                    break;

                case 'padding-top':
                    if (value === '0' || value === '0px') twClass = 'pt-0';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'pt');
                    else twClass = `pt-[${value}]`;
                    break;

                case 'padding-right':
                    if (value === '0' || value === '0px') twClass = 'pr-0';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'pr');
                    else twClass = `pr-[${value}]`;
                    break;

                case 'padding-bottom':
                    if (value === '0' || value === '0px') twClass = 'pb-0';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'pb');
                    else twClass = `pb-[${value}]`;
                    break;

                case 'padding-left':
                    if (value === '0' || value === '0px') twClass = 'pl-0';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'pl');
                    else twClass = `pl-[${value}]`;
                    break;

                // Sizing
                case 'width':
                    if (value === '100%') twClass = 'w-full';
                    else if (value === '100vw') twClass = 'w-screen';
                    else if (value === 'auto') twClass = 'w-auto';
                    else if (value === 'min-content') twClass = 'w-min';
                    else if (value === 'max-content') twClass = 'w-max';
                    else if (value === 'fit-content') twClass = 'w-fit';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'w');
                    else twClass = `w-[${value}]`;
                    break;

                case 'height':
                    if (value === '100%') twClass = 'h-full';
                    else if (value === '100vh') twClass = 'h-screen';
                    else if (value === 'auto') twClass = 'h-auto';
                    else if (value === 'min-content') twClass = 'h-min';
                    else if (value === 'max-content') twClass = 'h-max';
                    else if (value === 'fit-content') twClass = 'h-fit';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'h');
                    else twClass = `h-[${value}]`;
                    break;

                case 'min-width':
                    if (value === '100%') twClass = 'min-w-full';
                    else if (value === '0' || value === '0px') twClass = 'min-w-0';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'min-w');
                    else twClass = `min-w-[${value}]`;
                    break;

                case 'max-width':
                    if (value === '100%') twClass = 'max-w-full';
                    else if (value === 'none') twClass = 'max-w-none';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'max-w');
                    else twClass = `max-w-[${value}]`;
                    break;

                case 'min-height':
                    if (value === '100%') twClass = 'min-h-full';
                    else if (value === '100vh') twClass = 'min-h-screen';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'min-h');
                    else twClass = `min-h-[${value}]`;
                    break;

                case 'max-height':
                    if (value === '100%') twClass = 'max-h-full';
                    else if (value === '100vh') twClass = 'max-h-screen';
                    else if (value === 'none') twClass = 'max-h-none';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'max-h');
                    else twClass = `max-h-[${value}]`;
                    break;

                // Typography
                case 'font-size':
                    const fontSizeMap = {
                        '12px': 'text-xs', '14px': 'text-sm', '16px': 'text-base',
                        '18px': 'text-lg', '20px': 'text-xl', '24px': 'text-2xl',
                        '30px': 'text-3xl', '36px': 'text-4xl', '48px': 'text-5xl',
                        '60px': 'text-6xl', '72px': 'text-7xl', '96px': 'text-8xl',
                        '128px': 'text-9xl'
                    };
                    twClass = fontSizeMap[value] || `text-[${value}]`;
                    break;

                case 'font-weight':
                    const fontWeightMap = {
                        '100': 'font-thin', '200': 'font-extralight',
                        '300': 'font-light', '400': 'font-normal', 'normal': 'font-normal',
                        '500': 'font-medium', '600': 'font-semibold',
                        '700': 'font-bold', 'bold': 'font-bold',
                        '800': 'font-extrabold', '900': 'font-black'
                    };
                    twClass = fontWeightMap[value] || `font-[${value}]`;
                    break;

                case 'line-height':
                    const lineHeightMap = {
                        '1': 'leading-none', '1.25': 'leading-tight',
                        '1.375': 'leading-snug', '1.5': 'leading-normal',
                        '1.625': 'leading-relaxed', '2': 'leading-loose'
                    };
                    twClass = lineHeightMap[value] || `leading-[${value}]`;
                    break;

                case 'text-align':
                    const textAlignMap = {
                        'left': 'text-left', 'center': 'text-center',
                        'right': 'text-right', 'justify': 'text-justify',
                        'start': 'text-start', 'end': 'text-end'
                    };
                    twClass = textAlignMap[value];
                    break;

                case 'color':
                    twClass = colorToTw(value, 'text');
                    break;

                // Background
                case 'background-color':
                case 'background':
                    if (!value.includes('url') && !value.includes('gradient')) {
                        twClass = colorToTw(value, 'bg');
                    } else {
                        twClass = `bg-[${value.replace(/\s+/g, '_')}]`;
                    }
                    break;

                // Border
                case 'border-radius':
                    const radiusMap = {
                        '0': 'rounded-none', '0px': 'rounded-none',
                        '2px': 'rounded-sm', '4px': 'rounded',
                        '6px': 'rounded-md', '8px': 'rounded-lg',
                        '12px': 'rounded-xl', '16px': 'rounded-2xl',
                        '24px': 'rounded-3xl', '9999px': 'rounded-full',
                        '50%': 'rounded-full'
                    };
                    twClass = radiusMap[value] || `rounded-[${value}]`;
                    break;

                case 'border':
                    if (value === 'none' || value === '0') twClass = 'border-0';
                    else twClass = `border-[${value.replace(/\s+/g, '_')}]`;
                    break;

                case 'border-width':
                    const borderWidthMap = {
                        '0': 'border-0', '0px': 'border-0',
                        '1px': 'border', '2px': 'border-2',
                        '4px': 'border-4', '8px': 'border-8'
                    };
                    twClass = borderWidthMap[value] || `border-[${value}]`;
                    break;

                case 'border-color':
                    twClass = colorToTw(value, 'border');
                    break;

                // Position
                case 'position':
                    const positionMap = {
                        'static': 'static', 'fixed': 'fixed',
                        'absolute': 'absolute', 'relative': 'relative',
                        'sticky': 'sticky'
                    };
                    twClass = positionMap[value];
                    break;

                case 'top':
                    if (value === '0' || value === '0px') twClass = 'top-0';
                    else if (value === 'auto') twClass = 'top-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'top');
                    else twClass = `top-[${value}]`;
                    break;

                case 'right':
                    if (value === '0' || value === '0px') twClass = 'right-0';
                    else if (value === 'auto') twClass = 'right-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'right');
                    else twClass = `right-[${value}]`;
                    break;

                case 'bottom':
                    if (value === '0' || value === '0px') twClass = 'bottom-0';
                    else if (value === 'auto') twClass = 'bottom-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'bottom');
                    else twClass = `bottom-[${value}]`;
                    break;

                case 'left':
                    if (value === '0' || value === '0px') twClass = 'left-0';
                    else if (value === 'auto') twClass = 'left-auto';
                    else if (value.includes('px')) twClass = pxToTw(value.replace('px', ''), 'left');
                    else twClass = `left-[${value}]`;
                    break;

                case 'z-index':
                    const zIndexMap = {
                        '0': 'z-0', '10': 'z-10', '20': 'z-20',
                        '30': 'z-30', '40': 'z-40', '50': 'z-50',
                        'auto': 'z-auto'
                    };
                    twClass = zIndexMap[value] || `z-[${value}]`;
                    break;

                // Overflow
                case 'overflow':
                    const overflowMap = {
                        'auto': 'overflow-auto', 'hidden': 'overflow-hidden',
                        'visible': 'overflow-visible', 'scroll': 'overflow-scroll',
                        'clip': 'overflow-clip'
                    };
                    twClass = overflowMap[value];
                    break;

                case 'overflow-x':
                    twClass = `overflow-x-${value}`;
                    break;

                case 'overflow-y':
                    twClass = `overflow-y-${value}`;
                    break;

                // Opacity
                case 'opacity':
                    const opacityVal = parseFloat(value);
                    if (!isNaN(opacityVal)) {
                        const percent = Math.round(opacityVal * 100);
                        const opacityMap = { 0: '0', 5: '5', 10: '10', 20: '20', 25: '25', 30: '30', 40: '40', 50: '50', 60: '60', 70: '70', 75: '75', 80: '80', 90: '90', 95: '95', 100: '100' };
                        twClass = opacityMap[percent] !== undefined ? `opacity-${opacityMap[percent]}` : `opacity-[${value}]`;
                    }
                    break;

                // Cursor
                case 'cursor':
                    const cursorMap = {
                        'auto': 'cursor-auto', 'default': 'cursor-default',
                        'pointer': 'cursor-pointer', 'wait': 'cursor-wait',
                        'text': 'cursor-text', 'move': 'cursor-move',
                        'not-allowed': 'cursor-not-allowed', 'none': 'cursor-none',
                        'grab': 'cursor-grab', 'grabbing': 'cursor-grabbing'
                    };
                    twClass = cursorMap[value] || `cursor-[${value}]`;
                    break;

                // Box Shadow
                case 'box-shadow':
                    if (value === 'none') twClass = 'shadow-none';
                    else twClass = `shadow-[${value.replace(/\s+/g, '_')}]`;
                    break;

                // Transform
                case 'transform':
                    if (value === 'none') twClass = 'transform-none';
                    else twClass = `[transform:${value.replace(/\s+/g, '_')}]`;
                    break;

                // Transition
                case 'transition':
                    if (value === 'none') twClass = 'transition-none';
                    else if (value === 'all') twClass = 'transition-all';
                    else twClass = `[transition:${value.replace(/\s+/g, '_')}]`;
                    break;

                // 其他属性使用任意值语法
                default:
                    twClass = `[${property}:${value.replace(/\s+/g, '_')}]`;
            }

            if (twClass) {
                tailwindClasses.push(twClass);
            }
        });

        return [...new Set(tailwindClasses)].join(' ');
    }

    // 防抖函数
    let debounceTimer;
    function debounceConvert() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const cssText = cssInput.value;
            
            if (!cssText.trim()) {
                tailwindOutput.value = '';
                return;
            }

            const result = convertCSStoTailwind(cssText);
            tailwindOutput.value = result;

            // 自动复制到剪贴板
            if (result && result.trim()) {
                try {
                    await copyToClipboard(result);
                    showStatus('✓ 已自动复制到剪贴板！', 'success');
                } catch (err) {
                    showStatus('自动复制失败，请点击复制按钮', 'error');
                }
            }
        }, 300);
    }

    // 监听输入变化
    cssInput.addEventListener('input', debounceConvert);

    // 监听粘贴事件（立即触发转换）
    cssInput.addEventListener('paste', () => {
        setTimeout(debounceConvert, 50);
    });

    // 初始提示
    console.log('%c[CSS→Tailwind] 转换器已加载 🎨', 'color: #89b4fa; font-weight: bold;');
})();
