import localFont from 'next/font/local'

// Geist Variable Font
export const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  display: 'swap',
  preload: true,
})

// Geist Mono Variable Font
export const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  display: 'swap',
  preload: true,
})

// SF Pro Display fonts
export const sfProDisplay = localFont({
  src: [
    {
      path: './fonts/SFPRO/SFPRODISPLAYTHIN.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/SFPRO/SFPRODISPLAYREGULAR.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/SFPRO/SFPRODISPLAYMEDIUM.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/SFPRO/SFPRODISPLAYBOLD.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sf-pro-display',
  display: 'swap',
  preload: true,
})

// SF Mono font
export const sfMono = localFont({
  src: [
    {
      path: './fonts/SFMONO/SFMonoLight.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/SFMONO/SFMonoRegular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/SFMONO/SFMonoSemibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/SFMONO/SFMonoBold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/SFMONO/SFMonoHeavy.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-sf-mono',
  display: 'swap',
  preload: true,
}) 