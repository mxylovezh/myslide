const isMain = str => (/^#{1,2}(?!#)/).test(str);
const isSub = str => (/^#{3}(?!#)/).test(str);
const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)
const convert = raw => {
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s !== "").map(s => s.trim());
  // 用换行切分,后面可能有空格或者一道三个#号,在后面不是#号才切分
  let html = '';
  for (let i = 0; i < arr.length; i++) {

    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {
        html += `
                  <section data-markdown>
                  <textarea data-template>
                  ${arr[i]}
                  </textarea>
                  </section>
                  `
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
        html += `
                  <section>
                  <section data-markdown>
                  <textarea data-template>
                  ${arr[i]}
                  </textarea>
                  </section>
                  `
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
        html += `
                  <section data-markdown>
                  <textarea data-template>
                  ${arr[i]}
                  </textarea>
                  </section>
                  `
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
        html += `
                  <section data-markdown>
                  <textarea data-template>
                  ${arr[i]}
                  </textarea>
                  </section>
                  </section>
                  `
      }

    } else {
      if (isMain(arr[i])) {
        html += `
                  <section data-markdown>
                  <textarea data-template>
                  ${arr[i]}
                  </textarea>
                  </section>
                  `
      } else if (isSub(arr[i])) {
        html += `
                  <section data-markdown>
                  <textarea data-template>
                  ${arr[i]}
                  </textarea>
                  </section>
                  </section>
                  `
      }
    }

  }
  return html
}

const Menu = {
  init() {
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')
    this.bind()
  },

  bind() {
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add('open')
    }
    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove('open')
    }
    this.$$tabs.forEach(($tab, index) => $tab.onclick = () => {
      this.$$tabs.forEach($tab => $tab.classList.remove('active'))
      $tab.classList.add('active')
      this.$$contents.forEach($content => $content.classList.remove('active'))
      this.$$contents[index].classList.add('active')
    })
  }
}

const Editor = {
  init() {
    this.$textarea = $('.menu textarea')
    this.$btnSave = $('.btn-save')
    this.$html = $('.slides')

    this.bind()
    this.start()
  },

  bind() {
    this.$btnSave.onclick = () => {
      console.log(1)
      localStorage.markdown = this.$textarea.value;
      location.reload()

    }
  },

  start() {
    this.$textarea.value = localStorage.markdown || '# One Slide'
    this.$html.innerHTML = convert(localStorage.markdown || '# One Slide')
    Reveal.initialize({
      slideNumber: true,
      overview: true,
      controls: true,
      progress: true,
      center: localStorage.align !== 'left-top',
      hash: true,
      transition: localStorage.transition || 'slide',
      dependencies: [
        {
          src: 'plugin/markdown/marked.js',
          condition: function () { return !!document.querySelector('[data-markdown]'); }
        },
        {
          src: 'plugin/markdown/markdown.js',
          condition: function () { return !!document.querySelector('[data-markdown]'); }
        },
        {src: 'plugin/highlight/highlight.js'},
        {src: 'plugin/search/search.js', async: true},
        {src: 'plugin/zoom-js/zoom.js', async: true},
        {src: 'plugin/notes/notes.js', async: true}
      ]
    });
  }
}

const Theme = {
  init() {
    this.$$figure = $$('.menu .theme figure')
    this.$transitiion = $('.menu .transition')
    this.$align = $('.menu .align-way .align')
    this.$reval = $('.reveal')
    this.bind()
    this.loadTheme()
  },

  bind() {
    this.$$figure.forEach($figure => $figure.onclick = () => {
        this.$$figure.forEach($figure => $figure.classList.remove('selected'))
        $figure.classList.add('selected')
        this.setTheme($figure.dataset.theme)
      }
    )

    this.$transitiion.onchange = function () {
      localStorage.transition = this.value
      location.reload()
    }

    this.$align.onchange = function () {
      localStorage.align = this.value
      location.reload()
    }
  },

  setTheme(theme) {
    localStorage.theme = theme
    location.reload();
  },

  loadTheme() {
    let theme = localStorage.theme || 'night'
    const $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `css/theme/${theme}.css`
    document.head.appendChild($link)

    Array.from(this.$$figure).find($figure => $figure.dataset.theme === theme).classList.add('selected')
    this.$transitiion.value = localStorage.transition || 'slide'
    this.$align.value = localStorage.align || 'center'
    this.$reval.classList.add(this.$align.value)
  }

}


const ImgUploader = {
  init() {
    this.$fileInput = $('#img-loader')
    this.$textarea = $('.menu textarea')

    AV.init({
      appId: "5cmeGcY2539sCp40h5iCPstr-gzGzoHsz",
      appKey: "iw11rUurmbQEirqDiMDSviph",
      serverURLs: "https://5cmegcy2.lc-cn-n1-shared.com"
    })

    this.bind()
  },

  bind() {
    let self = this
    this.$fileInput.onchange = function () {
      if (this.files.length > 0) {
        let localFile = this.files[0]
        console.log(localFile)
        if (localFile.size / 1048576 > 2) {
          alert('文件不能超过2M')
          return
        }
        self.insertText(`![上传中，进度0%]()`)
        let avFile = new AV.File(encodeURI(localFile.name), localFile)
        avFile.save({
          keepFileName: true,
          onprogress(progress) {
            self.insertText(`![上传中，进度${progress.percent}%]()`)
          }
        }).then(file => {
          console.log('文件保存完成')
          console.log(file)
          let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
          self.insertText(text)
        }).catch(err => console.log(err))
      }
    }
  },

  insertText(text = '') {
    let $textarea = this.$textarea
    let start = $textarea.selectionStart
    let end = $textarea.selectionEnd
    let oldText = $textarea.value

    $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`
    $textarea.focus()
    $textarea.setSelectionRange(start, start + text.length)
  }
}


const Print = {
  init() {
    this.$download = $('.menu .download')

    this.bind()
    this.start()
  },
  bind() {
    this.$download.addEventListener('click', () => {
      let $link = document.createElement('a')
      $link.target = '_blank'
      $link.setAttribute('href', location.href.replace(/#\/.*/, '?print-pdf'))
      $link.click()
    })
  },
  start() {
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    if (window.location.search.match(/print-pdf/gi)) {
      link.href = 'css/print/pdf.css'
      window.print()
    } else {
      link.href = 'css/print/paper.css'
    }
    document.head.appendChild(link);
  }
}

const App = {
  init() {
    [...arguments].forEach(item => item.init())
  }
}

App.init(Menu, Editor, Theme, Print, ImgUploader)


