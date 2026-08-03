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
  |style|gallery|布局风格：`gallery` 图库式 / `card` 迷你卡片式|
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

  slide 的内容会作为描述文本渲染（支持 Markdown）。即使首页 swiper 关闭，文章内 tag 也能独立工作，且适配 Shoka PJAX。

  两种风格均默认开启**自动播放**（3s 间隔）、**鼠标滚轮翻页**和**循环轮播**（滚到最后自动回到第一张）。可通过参数关闭：

  ```markdown
  {% swiper style:gallery, autoplay:false, mousewheel:false %}
  ```

  自定义自动播放间隔（毫秒）：

  ```markdown
  {% swiper style:gallery, autoplay:5000 %}
  ```
