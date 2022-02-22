import {
  ClasserProvider,
  CodeEditorProps,
  PreviewProps,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProps,
  SandpackProvider,
  SandpackProviderProps,
} from '@codesandbox/sandpack-react';
import React from 'react';

export const Sandpack: React.FC<SandpackProps> = (props) => {
  // Combine files with customSetup to create the user input structure
  const userInputSetup = props.files
    ? {
        ...props.customSetup,
        files: {
          ...props.customSetup?.files,
          ...props.files,
        },
      }
    : props.customSetup;

  const previewOptions: PreviewProps = {
    showNavigator: props.options?.showNavigator,
  };

  const codeEditorOptions: CodeEditorProps = {
    showTabs: props.options?.showTabs,
    showLineNumbers: props.options?.showLineNumbers,
    showInlineErrors: props.options?.showInlineErrors,
    wrapContent: props.options?.wrapContent,
    closableTabs: props.options?.closableTabs,
    initMode: props.options?.initMode,
    extensions: props.options?.codeEditor?.extensions,
    extensionsKeymap: props.options?.codeEditor?.extensionsKeymap,
    readOnly: props.options?.readOnly,
    showReadOnly: props.options?.showReadOnly,
  };

  const providerOptions: SandpackProviderProps = {
    openPaths: props.options?.openPaths,
    activePath: props.options?.activePath,
    recompileMode: props.options?.recompileMode,
    recompileDelay: props.options?.recompileDelay,
    autorun: props.options?.autorun ?? true,
    bundlerURL: props.options?.bundlerURL,
    startRoute: props.options?.startRoute,
    skipEval: props.options?.skipEval,
    fileResolver: props.options?.fileResolver,
    initMode: props.options?.initMode,
    initModeObserverOptions: props.options?.initModeObserverOptions,
    externalResources: props.options?.externalResources,
  };

  // Parts are set as `flex` values, so they set the flex shrink/grow
  // Cannot use width percentages as it doesn't work with
  // the automatic layout break when the component is under 700px
  const editorPart = props.options?.editorWidthPercentage || 50;
  const previewPart = 100 - editorPart;
  const editorHeight = props.options?.editorHeight;

  return (
    <SandpackProvider
      customSetup={userInputSetup}
      template={props.template}
      {...providerOptions}
    >
      <ClasserProvider classes={props.options?.classes}>
        <SandpackLayout theme={props.theme}>
          <SandpackCodeEditor
            {...codeEditorOptions}
            customStyle={{
              height: editorHeight,
              flexGrow: editorPart,
              flexShrink: editorPart,
              minWidth: 700 * (editorPart / (previewPart + editorPart)),
            }}
          />
          <SandpackPreview
            {...previewOptions}
            showSandpackErrorOverlay={false}
            customStyle={{
              height: editorHeight,
              flexGrow: previewPart,
              flexShrink: previewPart,
              minWidth: 700 * (previewPart / (previewPart + editorPart)),
            }}
          />
        </SandpackLayout>
      </ClasserProvider>
    </SandpackProvider>
  );
};
