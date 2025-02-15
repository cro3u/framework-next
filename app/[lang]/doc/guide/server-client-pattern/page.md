## 개요
React 애플리케이션을 구축할 때 서버나 클라이언트에서 애플리케이션의 어떤 부분을 렌더링해야 하는지 고려해야 합니다. 
이 페이지에서는 서버 및 클라이언트 구성 요소를 사용할 때 권장되는 몇 가지 구성 패턴을 다룹니다.


## 컴포넌트간 데이터 공유

서버에서 데이터를 가져올 때 여러 구성 요소 간에 데이터를 공유해야 하는 경우가 있을 수 있습니다.  
예를 들어 동일한 데이터에 의존하는 레이아웃과 페이지가 있을 수 있습니다.

서버에서 사용할 수 없는 React Context를 사용하거나 데이터를 props로 전달하는 대신 fetch 또는 React의 캐시 기능을 사용하여 필요한 구성 요소에서 동일한 데이터를 가져올 수 있습니다.

동일한 데이터에 대한 중복 요청에 대해 걱정할 필요가 없습니다. React는 데이터 요청을 자동으로 메모하기 위해 fetch를 확장하고, fetch가 불가능할 때 캐시 기능을 사용할 수 있기 때문입니다.

```ts
import 'server-only'

export async function getData() {
  const res = await fetch('https://external-service.com/data', {
    headers: {
      authorization: process.env.API_KEY,
    },
  })
 
  return res.json()
}
```

언뜻 보면 getData가 서버와 클라이언트 모두에서 작동하는 것처럼 보입니다. 
그러나 이 함수에는 서버에서만 실행되도록 작성된 API_KEY가 포함되어 있습니다.

환경 변수 API_KEY에는 NEXT_PUBLIC 접두사가 붙지 않으며 서버에서만 액세스할 수 있는 개인 변수입니다.
<i>client-only 패키지는 일단 사용하지 않습니다.</i>

getData()를 가져오는 클라이언트 구성 요소는 이 모듈이 서버에서만 사용될 수 있다는 것을 설명하는 빌드 시간 오류를 수신합니다.

## 타사 패키지 및 공급자 사용
서버 구성 요소는 새로운 React 기능이므로 생태계의 타사 패키지 및 공급자는 useState, useEffect 및 createContext와 같은 클라이언트 전용 기능을 사용하는 구성 요소에 "use client" 지시문을 추가하기 시작했습니다.  

만약 외부 라이브러리를 사용한다 가정합니다.
```tsx
// components/Gallery
'use client'
 
import { useState } from 'react'
import { Carousel } from 'acme-carousel'
 
export default function Gallery() {
  let [isOpen, setIsOpen] = useState(false)
 
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>View pictures</button>
 
      {/* Works, since Carousel is used within a Client Component */}
      {isOpen && <Carousel />}
    </div>
  )
}

// test/page
import { Carousel } from 'acme-carousel'
 
export default function Page() {
  return (
    <div>
      <p>View pictures</p>
 
      {/* Error: `useState` can not be used within Server Components */}
      <Carousel />
    </div>
  )
}
```
만약 서버 환경내에서 사용하려고 하면, 오류가 발생합니다.
이는 Next.js가 <Carousel />이 클라이언트 전용 기능을 사용하고 있다는 것을 모르기 때문입니다.  

수정을 위해 클라이언트 전용 컴포넌트임을 명시합니다.
```tsx
// components/Carousel.tsx
'use client'
 
import { Carousel } from 'acme-carousel'
 
export default Carousel
```
이제 서버 컴포넌트인 `Page`에서 `Carousel`을 사용할 수 있습니다.

## 지원되지 않는 패턴: 서버 구성 요소를 클라이언트 구성 요소로 가져오기

```tsx
'use client'
 
// You cannot import a Server Component into a Client Component.
import ServerComponent from './Server-Component'
 
export default function ClientComponent({
  children,
}: {
  children: React.ReactNode
}) {
  const [count, setCount] = useState(0)
 
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
 
      <ServerComponent />
    </>
  )
}

```


## 지원되는 패턴: 서버 구성 요소를 클라이언트 구성 요소에 소품으로 전달
서버 구성 요소를 클라이언트 구성 요소에 소품으로 전달할 수 있습니다.  
아래 예에서 `<ClientComponent>`는 children prop을 허용합니다.

```tsx
// This pattern works:
// You can pass a Server Component as a child or prop of a
// Client Component.
import ClientComponent from './client-component'
import ServerComponent from './server-component'
 
// Pages in Next.js are Server Components by default
export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent />
    </ClientComponent>
  )
}
```
이 접근 방식을 사용하면 `<ClientComponent>`와 `<ServerComponent>`가 분리되어 독립적으로 렌더링될 수 있습니다.  
이 경우 `<ClientComponent>`가 클라이언트에 렌더링되기 훨씬 전에 하위 `<ServerComponent>`가 서버에 렌더링될 수 있습니다.