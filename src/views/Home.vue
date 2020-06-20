<template>
  <div class="home">
    <section>
      <b-carousel
        :indicator="false"
        :indicator-background="true"
        :indicator-inside="true"
        :indicator-mode="'hover'"
        :indicator-position="'is-top'"
        :indicator-style="'is-lines'">
        <b-carousel-item v-for="(item, i) in projects" :key="i">
          <section :class="`hero is-medium is-${item.color}`" :style="item.style">
            <div class="hero-body has-text-centered">
              <h1 class="title">{{ item.title }}</h1>
              <h2 class="subtitle">{{ item.subtitle }}</h2>
            </div>
          </section>
        </b-carousel-item>
      </b-carousel>
    </section>
    <app-footer></app-footer>
  </div>
</template>

<script>
import Footer from '@/components/Footer.vue'

export default {
  name: 'Home',
  components: {
    "app-footer": Footer
  },
  data() {
    return {
      projects: [
        { 
          title: 'CodeIgniter 4 - Module Generator',
          subtitle: 'With the help of this, you can create files of module like Controller, Model, View, MySQL.',
          color: 'danger is-bold',
          style: 'background-color: #4158D0; background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);'
        }
      ]
    } 
  }
}
</script>
