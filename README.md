# hexo-shoka-swiper

给`hexo-theme-shoka`添加 [首页轮播图](https://akilar.top/posts/8e1264d1/)

## 安装

1. 安装插件,在博客`根目录`下打开终端，运行以下指令：
  ```bash
  npm install hexo-shoka-swiper --save
  ```

2. 添加配置信息，以下为写法示例
  在站点配置文件`_config.yml`或者主题配置文件`_config.shoka.yml`中添加

  ```yaml
    # hexo-shoka-swiper
    # 首页轮播图
    swiper:
      enable: true # 开关
      priority: 5 # 过滤器优先权
      enable_page: / # 应用页面
      exclude: # 屏蔽页面
        # - /posts/
        # - /about/
      timemode: date # date/updated
      layout: # 挂载容器类型
        type: class
        name: 'index wrap'
        index: 0
      error_img: /images/loading.gif # 封面图片加载失败的默认封面
      insertposition: afterbegin
      default_descr: 再怎么看我也不知道怎么描述它的啦！
      swiper_css: https://cdn.jsdelivr.net/npm/hexo-shoka-swiper/lib/swiper.min.css # swiper css 依赖
      swiper_js: https://cdn.jsdelivr.net/npm/hexo-shoka-swiper/lib/swiper.min.js # swiper js 依赖
      custom_css: https://cdn.jsdelivr.net/npm/hexo-shoka-swiper/lib/swiperstyle.css # 适配主题样式补丁
      custom_js: https://cdn.jsdelivr.net/npm/hexo-shoka-swiper/lib/swiper_init.js # swiper 初始化方法
  ```
3. 参数释义

  |参数|备选值/类型|释义|
  |:--|:--|:--|
  |priority|number|【可选】过滤器优先级，数值越小，执行越早，默认为10，选填|
  |enable|true/false|【必选】控制开关|
  |enable_page|path/all|【可选】填写想要应用的页面的相对路径（即路由地址）,如根目录就填'/',分类页面就填'/categories/'。若要应用于所有页面，就填'all'，默认为all|
  |exclude|path|【可选】填写想要屏蔽的页面，可以多个。仅当enable_page为'all'时生效。写法见示例。原理是将屏蔽项的内容逐个放到当前路径去匹配，若当前路径包含任一屏蔽项，则不会挂载。|
  |timemode|date/updated|【可选】时间显示，date为显示创建日期，updated为显示更新日期,默认为date|
  |layout.type|id/class|【可选】挂载容器类型，填写id或class，不填则默认为id|
  |layout.name|text|【必选】挂载容器名称|
  |layout.index|0和正整数|【可选】前提是layout.type为class，因为同一页面可能有多个class，此项用来确认究竟排在第几个顺位|
  |error_img|url|封面图片加载失败时的替换图片|
  |insertposition|text|'beforebegin'：元素自身的前面。'afterbegin'：插入元素内部的第一个子节点之前。'beforeend'：插入元素内部的最后一个子节点之后。'afterend'：插入元素自身的后面。|
  |default_descr|text|【可选】默认文章描述|
  |swiper_css|url|【可选】自定义的swiper依赖项css链接|
  |swiper_js|url|【可选】自定义的swiper依赖项加js链接|
  |custom_css|url|【可选】适配主题样式补丁|
  |custom_js|url|【可选】swiper初始化方法|
  |gk_slides|true/false|【可选】`{% swiper %}` 是否把 gk 卡片拆成 slide，默认 false；tag 参数 `gk:true/false` 可覆盖|
  |gk_carousel|true/false|【可选】gk 卡片内的多图是否用轮播展示，默认 true；条目中用 `carousel: true/false` 覆盖|
  |gk_autoplay|number|【可选】gk 卡片多图轮播的自动播放间隔（毫秒），默认 0 表示不自动播放|

4. 使用方法
  在文章的`front_matter`中添加`swiper_index`配置项即可。
  ```markdown
  ---
  title: 文章标题
  date: 创建日期
  updated: 更新日期
  cover: 文章封面
  description: 文章描述
  swiper_index: 1 # 置顶轮播图顺序，需填非负整数，数字越大越靠前
  ---
  ```

  > 如果你的博客安装了 [hexo-hide-posts](https://github.com/prinsss/hexo-hide-posts)（0.4.x），被隐藏的文章（front_matter 中 `hidden: true`）默认不会出现在任何列表中，包括本插件的轮播。若希望某篇隐藏文章也进入轮播，只需在它的 front_matter 中同时设置 `swiper_index` 即可，插件会自动读取 `hexo-hide-posts` 提供的 `hidden_posts` 变量。

  如需使用**视频卡片**，增加以下 front_matter 配置：

  ```markdown
  ---
  title: 文章标题
  date: 创建日期
  cover: 视频封面图（可选）
  description: 文章描述
  swiper_index: 1
  swiper_type: video           # 卡片类型：video
  swiper_video: https://...    # 自托管视频直链（mp4/webm），与 swiper_video_embed 二选一
  swiper_video_poster: /images/poster.jpg  # 视频封面图（可选，仅自托管视频）
  # swiper_video_embed: <iframe ...></iframe>  # 平台嵌入代码，与 swiper_video 二选一
  ---
  ```

  **视频卡片参数说明：**

  |参数|必选|释义|
  |:--|:--|:--|
  |swiper_type|【必选】|填 `video` 启用视频卡片 |
  |swiper_video|【二选一】|自托管视频文件直链（mp4、webm 等），使用 `<video>` 标签播放 |
  |swiper_video_embed|【二选一】|平台嵌入 iframe 代码，如 B站、YouTube 的分享嵌入 HTML |
  |swiper_video_poster|【可选】|视频加载前显示的封面图，仅对 `swiper_video` 生效 |

  **B站嵌入示例：**
  ```markdown
  swiper_type: video
  swiper_video_embed: <iframe src="//player.bilibili.com/player.html?bvid=BV1xx411c7mD" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="100%"></iframe>
  ```

  **YouTube 嵌入示例：**
  ```markdown
  swiper_type: video
  swiper_video_embed: <iframe src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen width="100%" height="100%"></iframe>
  ```

  不指定 `swiper_type` 或留空则默认使用图片卡片，不影响已有文章。

5. 文章内轮播（Tag 插件）

  在文章 Markdown 中使用 `{% swiper %}` 标签插入轮播。

  **图库式（gallery）** — 适合图片集、教程截图、作品展示：

  ```markdown
  {% swiper style:gallery, ratio:16:9 %}
    {% slide cover:/images/photo1.jpg %}
      ### 图片标题
      图片描述文字（支持 Markdown）
    {% endslide %}
    {% slide cover:/images/photo2.jpg %}
    {% endslide %}
    {% slide video:/videos/demo.mp4, poster:/images/cover.jpg %}
      视频说明
    {% endslide %}
    {% slide embed:"<iframe src=\"//player.bilibili.com/player.html?bvid=xxx\" allowfullscreen></iframe>" %}
      B站嵌入示例
    {% endslide %}
  {% endswiper %}
  ```

  **迷你卡片式（card）** — 适合文章内嵌推荐内容，fade 切换：

  ```markdown
  {% swiper style:card %}
    {% slide cover:/images/post1.jpg, link:/posts/hello/ %}
      推荐文章标题
    {% endslide %}
    {% slide cover:/images/post2.jpg %}
      另一篇文章描述
    {% endslide %}
  {% endswiper %}
  ```

  **swiper 参数：**

  |参数|默认值|释义|
  |:--|:--|:--|
  |style|gallery|布局风格：`gallery` 图库式 / `card` 迷你卡片式 / `gk` gk 卡片式|
  |ratio|16:9|gallery 模式下媒体宽高比：`16:9` / `4:3` / `1:1`|
  |autoplay|3000|自动播放间隔（毫秒），`false` 关闭自动播放|
  |mousewheel|true|鼠标滚轮翻页开关，`false` 关闭|

  **slide 参数：**

  |参数|释义|
  |:--|:--|
  |cover|图片 URL|
  |link|点击跳转链接|
  |video|自托管视频直链（mp4/webm）|
  |poster|视频封面图|
  |embed|平台嵌入 iframe 代码|
  |type|`image` / `video`（通常自动检测，可不填）|

  **兼容 Shoka 主题 gk 卡片（`{% gk %}` / `{% gkfile %}`）**

  在 `{% swiper %}` 里放 gk 卡片时，每张 `.gk-item` 可以成为一张 slide（容器风格自动用 `gk`）。该行为**默认关闭**，按需打开：

  ```yml
  # _config.yml 或 _config.shoka.yml
  swiper:
    gk_slides: true     # 默认 false：不把 gk 卡片拆成 slide
  ```

  ```markdown
  {% swiper gk:true, autoplay:false %}
    {% gkfile "toys/_data.yml" %}
  {% endswiper %}
  ```

  开关优先级：tag 参数 `gk:true` / `gk:false` > 显式 `style:gk` > 配置 `swiper.gk_slides`（默认 `false`）。

  |写法|含义|
  |:--|:--|
  |`{% swiper gk:true %}`|本次把 gk 卡片拆成 slide（无视配置）|
  |`{% swiper gk:false %}`|本次不拆，gk 卡片原样落入容器（可自己用 `{% slide %}` 包裹）|
  |`{% swiper style:gk %}`|显式声明 gk 风格，等价于开启|
  |配置 `gk_slides: true`|全局默认开启，标签里可省略 `gk:true`|

  也可以把 gk 卡片写进单个 `{% slide %}`（用 `type:gk` 显式声明，或全局开启后自动识别），此时卡片本体即 slide 内容（不再生成封面图与描述浮层）：

  ```markdown
  {% swiper %}
    {% slide type:gk %}
      {% gk "figure" %}
      - name: 初音未来
        price: ¥4,800
        release: 2023-03
      {% endgk %}
    {% endslide %}
  {% endswiper %}
  ```

  gk 卡片的图片使用 `data-src` 懒加载，插件会在初始化时补全 `src`，避免非当前 slide 的图片一直空白；`{% gkfile %}` 是异步标签，插件已将 `swiper` / `slide` 注册为异步标签以支持嵌套。

  **gk 卡片多图自动轮播**

  主题 gk 卡片在条目包含多张图片时会输出 `.gk-img > .gallery` 的纵向堆叠。插件在**构建期**把这种多图区域转换成 `.gk-swiper` 轮播结构（桌面端圆点 + 左右箭头，移动端滑动 + 圆点），运行时由 `swiper_init.js` 初始化实例，同时注入所需资源：

  ```yaml
  - name: 示例手办
    carousel: true      # 可选：该条目是否轮播，见下方「开关」
    images:
      - url: /images/a.jpg
      - url: /images/b.jpg
      - url: /images/c.jpg
  ```

  **开关**

  |位置|写法|说明|
  |:--|:--|:--|
  |站点/主题配置|`swiper.gk_carousel: true`|总开关，默认值：多图条目默认使用轮播|
  |站点/主题配置|`swiper.gk_carousel: false`|总开关关闭：多图条目保持原来的纵向堆叠|
  |gk 条目|`carousel: false`|该条目不做轮播（总开关开启时用来排除）|
  |gk 条目|`carousel: true`|该条目单独开启轮播（总开关关闭时用来挑选）|

  条目级的 `carousel` 由主题 gk 标签渲染成 `.gk-img[data-gk-carousel="on|off"]`，插件读取后决定该条目是否轮播；没写 `carousel` 的条目跟随总开关。

  - 单图卡片保持原样，不会被改写；
  - 轮播默认不自动播放，可用配置 `swiper.gk_autoplay`（毫秒）打开，例如 `gk_autoplay: 4000`；
  - 图片仍走主题的 `data-src` 懒加载：初始化时只加载当前与下一张，切换时继续补充；
  - 轮播内会忽略 gk 数据里为纵向堆叠写的 `style: zoom:50%` 缩放，保证与同页单图卡片的图片尺寸一致（需要保留可在自定义 CSS 中覆盖）；
  - 仅当页面确实存在需要轮播的多图 gk 卡片时才注入 Swiper 资源，已加载过资源的页面不会重复注入。

  slide 的内容会作为描述文本渲染（支持 Markdown）。即使首页 swiper 关闭，文章内 tag 也能独立工作，且适配 Shoka PJAX。

  三种风格（`gallery` / `card` / `gk`）均默认开启**自动播放**（3s 间隔）、**鼠标滚轮翻页**和**循环轮播**（滚到最后自动回到第一张）。可通过参数关闭：

  ```markdown
  {% swiper style:gallery, autoplay:false, mousewheel:false %}
  ```

  自定义自动播放间隔（毫秒）：

  ```markdown
  {% swiper style:gallery, autoplay:5000 %}
  ```
