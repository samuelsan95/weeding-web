<script setup>
import AppHeader from './components/AppHeader.vue'
import DateSection from './components/DateSection.vue'
import LocationSection from './components/LocationSection.vue'
import ScheduleSection from './components/ScheduleSection.vue'
import ConfirmationForm from './components/ConfirmationForm.vue'
import SongForm from './components/SongForm.vue'
import PhotosGallery from './components/PhotosGallery.vue'
import FooterSection from './components/FooterSection.vue'
import SeparateSection from './components/SeparateSection.vue'
import VideoIntro from './components/VideoIntro.vue'
</script>

<template>
  <VideoIntro />
  <AppHeader />
  <main>
    <DateSection />
    <LocationSection />
    <SeparateSection />
    <ScheduleSection />
    <ConfirmationForm />
    <SongForm />
    <PhotosGallery />
    <FooterSection />
  </main>
</template>
