import { buildTrie, type TrieNode } from 'trie-rules';

export const getRules = async (): Promise<TrieNode> => {
    console.info(`Download rules...`);

    const response = await fetch(process.env.API_PATH_RULES as string);
    const data = await response.json();

    const trie = buildTrie(data);

    console.info(`${data.length} rules processed`);

    return trie;
};
