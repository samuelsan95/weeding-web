<template>
  <Transition name="intro-fade">
    <div
      v-if="isVisible"
      class="video-intro"
      :class="{ 'is-fading-out': isFadingOut, 'is-playing': isPlaying }"
    >
      <div class="video-intro__media">
        <video
          ref="videoRef"
          class="video-intro__video"
          :poster="posterUrl"
          :src="videoSrc"
          autoplay
          muted
          playsinline
          preload="auto"
          @ended="onEnded"
          @canplay="onCanPlay"
          @error="onError"
        />
        <div class="video-intro__vignette" />
      </div>

      <div class="video-intro__overlay">
        <div class="video-intro__content" :class="{ 'is-visible': showText }">
          <p class="video-intro__eyebrow">¡Nos casamos!</p>
          <img
            class="video-intro__logo"
            :src="logoUrl"
            alt="Logo"
          />
          <p class="video-intro__date">26 · 06 · 2027</p>
        </div>
      </div>

      <button
        class="video-intro__skip"
        :class="{ 'is-visible': showText }"
        @click="handleSkip"
        aria-label="Saltar intro"
      >
        Saltar intro
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import videoDesktopWebm from '../assets/intro/video_desktop.webm'
import videoDesktopMp4 from '../assets/intro/video_desktop.mp4'
import videoMovilWebm from '../assets/intro/video_movil.webm'
import videoMovilMp4 from '../assets/intro/video_movil.mp4'
import posterDesktopUrl from '../assets/intro/poster_desktop.jpg'
import posterMovilUrl from '../assets/intro/poster_movil.jpg'
import logoUrl from '../assets/logo_white.png'

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
const posterUrl = isMobile ? posterMovilUrl : posterDesktopUrl

function supportsWebm() {
  if (typeof document === 'undefined') return false
  const v = document.createElement('video')
  return Boolean(v.canPlayType && v.canPlayType('video/webm; codecs="vp9,opus"'))
}

const videoSrc = (isMobile ? (supportsWebm() ? videoMovilWebm : videoMovilMp4)
                            : (supportsWebm() ? videoDesktopWebm : videoDesktopMp4))

const SESSION_KEY = 'wedding-intro-seen'
const MAX_DURATION = 6000
const FADE_OUT_MS = 1200

const isVisible = ref(true)
const isFadingOut = ref(false)
const isPlaying = ref(false)
const showText = ref(false)

let hideTimer: ReturnType<typeof setTimeout> | null = null
let safetyTimer: ReturnType<typeof setTimeout> | null = null

const videoRef = ref<HTMLVideoElement | null>(null)

function hide() {
  if (!isVisible.value) return
  isFadingOut.value = true
  sessionStorage.setItem(SESSION_KEY, '1')
  setTimeout(() => {
    isVisible.value = false
  }, FADE_OUT_MS)
}

function onEnded() {
  hide()
}

function onCanPlay(e: Event) {
  ;(e.target as HTMLVideoElement).play().catch(() => {
    showText.value = true
  })
  isPlaying.value = true
  setTimeout(() => {
    showText.value = true
  }, 600)
}

function onError() {
  showText.value = true
  hide()
}

onMounted(() => {
  if (sessionStorage.getItem(SESSION_KEY)) {
    isVisible.value = false
    return
  }
  safetyTimer = setTimeout(hide, MAX_DURATION)
})

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
  if (safetyTimer) clearTimeout(safetyTimer)
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.removeAttribute('src')
    videoRef.value.load()
  }
})

function handleSkip(e: MouseEvent) {
  e.stopPropagation()
  hide()
}
</script>

<style scoped>
.video-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  cursor: pointer;
  overflow: hidden;
  opacity: 1;
  transition: opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.video-intro.is-fading-out {
  opacity: 0;
  pointer-events: none;
}

.video-intro__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.video-intro__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  opacity: 0;
  transition: opacity 1400ms ease;
}

@media (max-width: 768px) {
  .video-intro__video {
    object-fit: cover;
  }
}

.video-intro.is-playing .video-intro__video {
  opacity: 1;
}

.video-intro__vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.55) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}

.video-intro__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: start;
  justify-content: center;
  padding: 24px;
  pointer-events: none;
}

.video-intro__content {
  text-align: center;
  color: #fff;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45);
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 1600ms ease 200ms, transform 1600ms cubic-bezier(0.2, 0.7, 0.2, 1) 200ms;
}

.video-intro__content.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.video-intro__eyebrow {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: var(--font-size-large);
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(8px);
  animation: introTextIn 1.4s cubic-bezier(0.2, 0.7, 0.2, 1) 0.4s forwards;
}

.video-intro__logo {
  display: block;
  width: clamp(140px, 22vw, 240px);
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 4px 28px rgba(0, 0, 0, 0.45));
  opacity: 0;
  transform: translateY(14px) scale(0.94);
  animation: introMonogramIn 1.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.7s forwards;
}

.video-intro__date {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: var(--font-size-xx-large);
  font-weight: 500;
  letter-spacing: 0.5em;
  margin-top: 28px;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0;
  transform: translateY(8px);
  animation: introTextIn 1.4s cubic-bezier(0.2, 0.7, 0.2, 1) 1.1s forwards;
}

@keyframes introTextIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes introMonogramIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.video-intro__skip {
  position: absolute;
  bottom: 28px;
  right: 28px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: var(--font-size-small);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 600ms ease 800ms, background 250ms ease, transform 250ms ease;
  z-index: 2;
}

.video-intro__skip.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.video-intro__skip:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}

.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .video-intro__eyebrow {
    font-size: var(--font-size-small);
    letter-spacing: 0.28em;
    margin-bottom: 18px;
  }

  .video-intro__logo {
    width: clamp(150px, 42vw, 220px);
  }

  .video-intro__date {
    font-size: var(--font-size-large);
    letter-spacing: 0.4em;
    margin-top: 22px;
  }

  .video-intro__skip {
    bottom: 20px;
    right: 20px;
    font-size: var(--font-size-x-small);
    padding: 8px 16px;
  }
}
</style>
