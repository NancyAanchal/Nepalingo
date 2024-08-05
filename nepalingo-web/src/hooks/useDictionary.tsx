import useSWR from "swr";
import { getNewariWord } from "@/lib/getNewariWord";
import { getTajpuriyaWord } from "@/lib/getTajpuriyaWord";
import { getGTranslate } from "@/lib/getGTranslate";

export type DictionaryProps = {
  language: string;
  word: string;
};

export type Meaning = {
  audio?: { uri: string };
  image?: { uri: string };
  language: string;
  meaningOriginal?: string;
  meaningNp?: string;
  meaningEn: string;
  partsOfSpeech?: string;
  dialect?: string;
  transliterations?: {
    deva: string;
    latn: string;
    original: string;
  };
};

export type DictionaryResponse = {
  language: string;
  word: string;
  meanings: Array<Meaning>;
};

async function getFetcherByLanguage(
  language: string,
  word?: string
): Promise<DictionaryResponse> {
  if (!word) {
    word = "hello";
  }

  switch (language) {
    case "Newari":
      const newariResult = await getNewariWord(word);
      if (newariResult.meanings.length > 0) {
        return newariResult;
      }
      // Fall back to Google Translate if no result is found
      const newariFallbackResult = await getGTranslate("newari", word);
      return {
        language,
        word,
        meanings: [
          {
            language,
            meaningEn: newariFallbackResult,
          },
        ],
      };
    case "Tajpuriya":
      return await getTajpuriyaWord(word);
    case "Maithili":
      const maithiliResult = await getGTranslate("maithili", word);
      return {
        language,
        word,
        meanings: [
          {
            language,
            meaningEn: maithiliResult,
          },
        ],
      };
    default:
      throw new Error(`Language ${language} not supported`);
  }
}

const useDictionary = ({ language, word }: DictionaryProps) => {
  const cacheKey = word ? `/${language}/${word}` : null;
  const { data, error, isLoading } = useSWR(cacheKey, () =>
    getFetcherByLanguage(language, word)
  );
  return { data, error, isLoading };
};

export default useDictionary;
