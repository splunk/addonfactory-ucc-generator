import { getStoryContext, TestRunnerConfig, waitForPageReady } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

const config: TestRunnerConfig = {
    setup() {
        expect.extend({ toMatchImageSnapshot });
    },
    logLevel: 'verbose',
    async preVisit(page, context) {
        const storyContext = await getStoryContext(page, context);
        const parameters = storyContext.parameters;

        const height = parameters.snapshots?.height || 600;
        const width = parameters.snapshots?.width || 1000;

        await page.setViewportSize({ width, height });
    },
    async postVisit(page, context) {
        const storyContext = await getStoryContext(page, context);

        const skipSnapshot = storyContext.tags.includes('skip-snapshots');
        if (skipSnapshot) {
            return;
        }

        const parameters = storyContext.parameters;
        const storyFilePath = parameters.fileName as string;
        const [_, srcFile] = storyFilePath.split('/src/');
        const srcStoryDir = srcFile.slice(0, srcFile.lastIndexOf('/'));

        const customSnapshotsDir = `${process.cwd()}/src/${srcStoryDir}/__images__/`;

        const browser = page.context().browser()?.browserType().name();
        const componentName = context.title.split('/')[1];
        const customSnapshotIdentifier =
            componentName + '-' + context.name.toLowerCase().replace(/ /g, '-') + '-' + browser;

        const customDiffDir = `${process.cwd()}/test-reports/visual/image_snapshot_diff/`;
        const customReceivedDir = `${process.cwd()}/test-reports/visual/image_snapshot_received/`;

        // can't use waitForPageReady because networkidle never fires due to HMR for locally running Storybook
        console.log('Starting to wait for .woff requests');
        console.time('Waiting for .woff requests');
        await page.waitForResponse((request) => {
            return request.url().includes('.woff');
        });
        console.log('Stopped waiting for .woff requests');
        console.timeEnd('Waiting for .woff requests');

        if (process.env.CI) {
            console.log('Waiting for page ready');
            console.time('Waiting for page ready');
            await waitForPageReady(page);
            console.timeEnd('Waiting for page ready');
        } else {
            await page.waitForLoadState('domcontentloaded');
            await page.waitForLoadState('load');
        }

        console.log('Waiting for fonts to be ready');
        console.time('Waiting for fonts to be ready');
        await page.evaluate(() => document.fonts.ready);
        console.timeEnd('Waiting for fonts to be ready');

        const image = await page.screenshot({ animations: 'disabled', scale: 'css' });
        expect(image).toMatchImageSnapshot({
            customSnapshotsDir,
            customDiffDir,
            customSnapshotIdentifier,
            storeReceivedOnFailure: true,
            customReceivedDir,
        });
    },
};
export default config;
