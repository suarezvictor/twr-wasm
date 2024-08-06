---
title: libc++ for WebAssembly
description: twr-wasm includes the standard c++ library libc++ built for WebAssembly.
---

# libc++ for WebAssembly
This section describes twr-wasm's support for using the standard c++ library libc++ with WebAssembly.

twr-wasm includes libc++ built for WebAssembly in the `twr-wasm/lib-c` folder.

For C++ the use of libc++ is optional.  That is you can build twr-wasm projects in C++ with or without libc++.

See the examples [tests-libcx](../examples/examples-libcxx.md) and [tests-user](../examples/examples-overview.md) for examples of using libc++.

See the [balls example](../examples/examples-balls.md) for how to create a C++ WebAssembly program without the standard C++ library.  The primary advantage to this approach is a bit smaller code size.  You don't need to staticly link libc++.

Some of the key options twr-wasm's libc++ for WebAssembly was built with are these:

~~~
DLIBCXX_ENABLE_LOCALIZATION=ON 
DLIBCXX_ENABLE_UNICODE=ON 
DLIBCXX_ENABLE_RTTI=ON 
DLIBCXX_ENABLE_STATIC_ABI_LIBRARY=ON 

DCMAKE_BUILD_TYPE=Release		
DCMAKE_CXX_STANDARD=20 

DLIBCXX_ENABLE_EXCEPTIONS=OFF 
DLIBCXX_ENABLE_THREADS=OFF 
DLIBCXX_ENABLE_SHARED=OFF 
DLIBCXX_ENABLE_WIDE_CHARACTERS=OFF 
DLIBCXX_ENABLE_FILESYSTEM=OFF 
DLIBCXX_ENABLE_TIME_ZONE_DATABASE=OFF 
DLIBCXX_ENABLE_MONOTONIC_CLOCK=OFF 
DLIBCXX_ENABLE_RANDOM_DEVICE=OFF
~~~

