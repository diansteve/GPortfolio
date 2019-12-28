import axios, { AxiosInstance } from 'axios';
import {
  IGithubContributor,
  IGithubProfile,
  IGithubRepository,
} from '../../interfaces/IGithub';
import config from '../../config';
import Module from '../../classes/Module';

/** @type {AxiosInstance} */
const axiosInstance: AxiosInstance = axios.create({
  headers: {
    Authorization: config.websites.github.token ? `token ${config.websites.github.token}` : null,
  },
});

/** @type {number} */
const MAX_COUNT: number = 100;

/** @type {string} */
const SELF_OWNER: string = 'gportfolio';

/** @type {string} */
const SELF_REP: string = 'gportfolio';

export default class Github extends Module {
  /**
   * Logger sections
   */
  static get sections() {
    return {
      contributors: 'Contributors',
      profile: 'Profile',
      repositories: 'Repositories',
    };
  }

  /**
   * Full url to get list of the repositories
   * @return {string}
   */
  static get URL_REPOSITORIES(): string {
    const append = config.websites.github.token
      ? 'user/repos'
      : `users/${config.websites.github.username}/repos`;

    return `${this.API}/${append}`;
  }

  /**
   * Full url to get profile
   * @return {string}
   */
  static get URL_PROFILE(): string {
    return `${this.API}/users/${config.websites.github.username}`;
  }

  public static API = 'https://api.github.com';

  /**
   * Full url to get list contributors.
   * @param {string} owner
   * @param {string} repo
   * @return {string}
   */
  public static URL_LIST_CONTRIBUTORS(owner: string, repo: string): string {
    return `${this.API}/repos/${owner}/${repo}/contributors`;
  }

  /**
   * Make a Github API request to get user data.
   * @return {Promise<IGithubProfile>} data
   * @throws
   * @see https://developer.github.com/v3/users/#get-a-single-user docs
   */
  public static async fetchProfile(): Promise<IGithubProfile> {
    Github.log(Github.sections.profile, 'Fetching data from API..').info();
    let response;

    try {
      response = await axiosInstance.get(Github.URL_PROFILE);
    } catch (e) {
      Github.log(Github.sections.profile, e).error();
      throw new Error(e);
    }

    Github.log(Github.sections.profile, 'Complete').success();

    return response.data;
  }

  /**
   * Make a Github API request to get user repositories.
   * @return {Promise<Array<IGithubRepository>>}
   * @throws
   * @see https://developer.github.com/v3/repos/#list-user-repositories docs
   */
  public static async fetchRepositories(): Promise<IGithubRepository[]> {
    let fetchRepositories;
    const repositories = [];
    let page = 1;

    const repositoryType = config.websites.github.token
      ? undefined
      : config.websites.github.parse.repositories.type;

    do {
      Github.log(Github.sections.repositories, `Fetching data from API.. | ${page} page`).info();

      try {
        /* eslint-disable-next-line no-await-in-loop */
        fetchRepositories = await axiosInstance.get(Github.URL_REPOSITORIES, {
          params: {
            ...config.websites.github.parse.repositories,
            page,
            per_page: MAX_COUNT,
            type: repositoryType,
          },
        });

        page += 1;
      } catch (e) {
        Github.log(Github.sections.repositories, e).error();
        throw new Error(e);
      }

      repositories.push(...fetchRepositories.data);
    } while (fetchRepositories.data.length === MAX_COUNT);

    Github.log(Github.sections.repositories, `Complete, ${repositories.length} length`).success();
    return repositories;
  }

  /**
   * Make a Github API request to get contributors.
   * @return {Promise<Array<IGithubContributor>>}
   * @throws
   * @see https://developer.github.com/v3/repos/#list-contributors docs
   */
  public static async fetchSelfContributors(): Promise<IGithubContributor[]> {
    const fetchUrl = Github.URL_LIST_CONTRIBUTORS(SELF_OWNER, SELF_REP);
    const contributors = [];
    let fetchContributors;
    let page = 1;

    do {
      Github.log(Github.sections.contributors, `Fetching data from API.. | ${page} page`).info();

      try {
        /* eslint-disable-next-line no-await-in-loop */
        fetchContributors = await axiosInstance.get(fetchUrl, {
          params: {
            ...config.websites.github.parse.repositories,
            page,
            per_page: MAX_COUNT,
          },
        });

        page += 1;
      } catch (e) {
        Github.log(Github.sections.contributors, e).error();
        throw new Error(e);
      }

      contributors.push(...fetchContributors.data);
    } while (fetchContributors.data.length === MAX_COUNT);

    Github.log(Github.sections.contributors, `Complete, ${contributors.length} length`).success();
    return contributors;
  }
}
