export async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function activeNode(node: cc.Node, state: boolean) {
    await delay((cc.director.getDeltaTime() * 1000) + Math.ceil(cc.director.getTotalTime() / cc.director.getTotalFrames()));
    node.active = state;
}
