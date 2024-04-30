
<script>


</script>

<template>
  <head></head>
  <body>
    <main class="background-init">
      <RouterView></RouterView>
    </main>
  </body>
</template>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
  height: 100%;
}

body, html{
  height: 100%;
  margin: 0;
}

.flex
{
  display: flex;
  flex-direction: row;
  width:100%;
}

.justify-between{
  justify-content: space-between;
}

.m-1{
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
