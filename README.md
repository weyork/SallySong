# Sally Song — Personal Website

一个轻量、可直接部署的静态个人网站：艺术感主页 + 多个子页面（Portfolio / Contact / Shop / Writing），支持深色模式与移动端导航。

## 本地预览

在该目录启动一个静态服务器（任选其一）：

### 方式 A：Python

```bash
cd "/Users/ziqisong/Desktop/Hi_Sally" && python3 -m http.server 5173
```

然后在浏览器打开 `http://localhost:5173`。

### 方式 B：Node（可选）

```bash
npx serve .
```

## 你最可能要改的地方

- `index.html`
  - 首页文案（hero 区域的介绍、四个入口卡片的文字）

- `portfolio.html`
  - 把占位图块 `.portfolio-thumb.is-placeholder` 替换成真实 `&lt;img&gt;`
  - 每个作品的标题与说明（`作品标题一` 等）

- `contact.html`
  - 邮箱目前已设为 `sallysong98@hotmail.com`
  - 三个社交链接卡片里的 `href` 与说明文字

- `shop.html`
  - 商品名称、描述、价格文案
  - 未来要加真实购买链接时，把按钮的 `disabled` 去掉并换成 `&lt;a href="..."&gt;`

- `writing.html`
  - 文章标题、标签、日期与摘要

- `styles.css`
  - 主题色：`--primary` / `--primary-2`

- `script.js`
  - 主题记忆 key：`sallysong.theme`（一般无需改）

## 部署

这是纯静态站点，可直接部署到：

- GitHub Pages
- Netlify / Vercel（选择 “Static” 即可）

