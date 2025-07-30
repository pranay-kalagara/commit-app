# Flutter Development Docker Image - Multi-architecture support
# Supports both ARM64 (M1/M2 Mac) and AMD64 (Intel) architectures
# Note: Uses x64 emulation for Flutter since ARM64 Flutter is not available for Linux
FROM --platform=linux/amd64 ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Set architecture variables for multi-platform builds
ARG TARGETPLATFORM
ARG BUILDPLATFORM

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    openjdk-11-jdk \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set up Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

# Download Android SDK command line tools (architecture-agnostic)
RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-9477386_latest.zip -d $ANDROID_SDK_ROOT/cmdline-tools && \
    mv $ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest && \
    rm commandlinetools-linux-9477386_latest.zip

# Accept Android licenses
RUN yes | sdkmanager --licenses || true

# Install Flutter - Architecture-aware download
ENV FLUTTER_VERSION=3.16.5
ENV FLUTTER_HOME=/opt/flutter
ENV PATH=$PATH:$FLUTTER_HOME/bin

# Download Flutter SDK (x64 only - ARM64 not officially supported for Linux)
# Note: Flutter will run on ARM64 through emulation
RUN echo "Downloading Flutter SDK for platform: $TARGETPLATFORM" && \
    FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz" && \
    echo "Flutter URL: $FLUTTER_URL" && \
    wget -q "$FLUTTER_URL" && \
    tar xf flutter_linux_${FLUTTER_VERSION}-stable.tar.xz -C /opt && \
    rm flutter_linux_${FLUTTER_VERSION}-stable.tar.xz

# Fix git permissions for Flutter
RUN git config --global --add safe.directory /opt/flutter
RUN git config --global --add safe.directory /opt/flutter/.pub-cache

# Pre-download Flutter dependencies
RUN flutter precache

# Verify Flutter installation
RUN flutter --version

# Set working directory
WORKDIR /app

# Copy pubspec files first for better caching
COPY pubspec.yaml pubspec.lock ./

# Install Flutter dependencies
RUN flutter pub get

# Copy the rest of the application
COPY . .

# Enable web support
RUN flutter config --enable-web

# Expose ports for Flutter web development
EXPOSE 8080 8081

# Default command
CMD ["flutter", "run", "-d", "web-server", "--web-port", "8080", "--web-hostname", "0.0.0.0"]
