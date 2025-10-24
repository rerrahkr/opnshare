#!/bin/bash -eux

docker build -t ymfm_emsdk_ts .

docker run --rm \
    -v $(pwd):/src \
    -v $(pwd)/build:/build \
    ymfm_emsdk_ts \
    bash -c 'emcmake cmake -B /build -S /src && cd /build && emmake make VERBOSE=1'
