#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It moves the /app folder to /app-example and creates a new /app folder with an index.tsx and _layout.tsx file.
 * You can remove the /app-example folder and the script after you have started working on your project.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const oldDirPath = path.join(root, 'app');
const newDirPath = path.join(root, 'app-example');
const newAppDirPath = path.join(root, 'app');

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}
`;

const moveDirectory = (oldDirPath, newDirPath) => {
    if (fs.existsSync(newDirPath)) {
        fs.rmSync(newDirPath, { recursive: true, force: true });
    }
    fs.renameSync(oldDirPath, newDirPath);
};

const createAppDirectory = (newAppDirPath) => {
    fs.mkdirSync(newAppDirPath, { recursive: true });
    fs.writeFileSync(path.join(newAppDirPath, 'index.tsx'), indexContent);
    fs.writeFileSync(path.join(newAppDirPath, '_layout.tsx'), layoutContent);
};

moveDirectory(oldDirPath, newDirPath);
createAppDirectory(newAppDirPath);

console.log('Project reset successfully!');
