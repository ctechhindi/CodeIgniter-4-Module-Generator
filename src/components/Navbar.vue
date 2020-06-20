<template>
  <b-navbar>
    <template slot="brand">
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <strong>C4-MG</strong>
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <b-icon icon="home"></b-icon>
        <span>Home</span>
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ name: 'Modules' }">
        <b-icon icon="playlist-plus"></b-icon>
        <span>Modules</span>
      </b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-item tag="div">
        <div class="buttons">
          <a class="button is-primary" target="_blank" href="https://github.com/ctechhindi/CodeIgniter-4-Module-Generator">
            <b-icon icon="git"></b-icon>&nbsp;
            <strong>GitHub</strong>
          </a>
          <a class="button is-danger" target="_blank" href="https://www.youtube.com/c/CTechHindi">
            <b-icon icon="youtube"></b-icon>&nbsp;
            <strong>YouTube</strong>
          </a>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  name: "Navbar"
};
</script>