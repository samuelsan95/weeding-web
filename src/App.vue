<script setup>
import AppHeader from './components/AppHeader.vue'
import DateSection from './components/DateSection.vue'
import LocationSection from './components/LocationSection.vue'
import ScheduleSection from './components/ScheduleSection.vue'
import ConfirmationForm from './components/ConfirmationForm.vue'
import SongForm from './components/SongForm.vue'
import PhotosCarousel from './components/PhotosCarousel.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <AppHeader />
  <main>
    <DateSection />
    <LocationSection />
    <ScheduleSection />
    <ConfirmationForm />
    <SongForm />
    <PhotosCarousel />
    <FooterSection />
  </main>
</template>

<style>
main {
  padding-top: 60px;
}
</style>