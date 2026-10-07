import Image from 'next/image';
import React from 'react';

export default function GridShape() {
  return (
    <>
      <div className="-z-1 max-w-62.5 xl:max-w-112.5 absolute right-0 top-0 w-full">
        <Image
          width={540}
          height={254}
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/shape/grid-01.svg`}
          alt="grid"
        />
      </div>
      <div className="-z-1 max-w-62.5 xl:max-w-112.5 absolute bottom-0 left-0 w-full rotate-180">
        <Image
          width={540}
          height={254}
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/shape/grid-01.svg`}
          alt="grid"
        />
      </div>
    </>
  );
}
