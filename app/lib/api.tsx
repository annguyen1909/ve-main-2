import axios, { AxiosError, AxiosInstance } from "axios";
import { Configuration, Resource, ResourceCollection, ResourceCollectionWithPagination } from "~/types/resources";
import { ClientResource } from "~/types/clients"
import { WorkResource } from "~/types/works"
import { CategoryResource } from "~/types/categories";
import { EmployeeResource } from "~/types/employees";
import { TagResource } from "~/types/tag";
import { NewsResource } from "~/types/news";
import { FlatformResource } from "~/types/flatforms";

type InternalServerErrorResponseType = {
  message: string;
};

type TooManyRequestsResponseType = {
  message: string;
};

type ValidationResponseType = {
  message: string;
  errors: { [n: string]: Array<string> };
};

class Api {
  protected instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.BASE_API_URL ?? 'https://api.visualennode.com',
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
  }

  isValidationResponse(
    error: Error
  ): error is AxiosError<ValidationResponseType> {
    return (
      // eslint-disable-next-line import/no-named-as-default-member
      axios.isAxiosError<ValidationResponseType>(error) &&
      !!error.response &&
      error.response.status === 422
    );
  }

  isTooManyRequestsResponse(
    error: Error
  ): error is AxiosError<TooManyRequestsResponseType> {
    return (
      // eslint-disable-next-line import/no-named-as-default-member
      axios.isAxiosError<TooManyRequestsResponseType>(error) &&
      !!error.response &&
      error.response.status === 429
    );
  }

  isInternalServerErrorResponse(
    error: Error
  ): error is AxiosError<InternalServerErrorResponseType> {
    return (
      // eslint-disable-next-line import/no-named-as-default-member
      axios.isAxiosError<InternalServerErrorResponseType>(error) &&
      !!error.response &&
      [500].includes(error.response.status)
    );
  }

  getConfiguration() {
    return new Promise<Configuration>(function (resolve) {
      setTimeout(function () {
        resolve({
          brand: {
            data: {
              url: "/favicon-dark.png",
              description: "Visual Ennode",
            },
          },
        });
      }, 100);
    });
  }

  getBanners() {
    return this.instance.get<ResourceCollection<{ group: string, url: string }>>("/public/attachments?group=banner");
  }

  getClients(locale: string) {
    return this.instance.get<ResourceCollection<ClientResource>>(
      "/public/clients",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }

  getWorks(locale: string, slug_category: string, query: string, tagId: string) {
    return this.instance.get<ResourceCollection<WorkResource>>(
      "/public/works",
      {
        headers: {
          "Accept-Language": locale
        },
        params: {
          'slug_category': slug_category,
          keywords: query,
          tag_id: tagId
        }
      }
    );
  }

  getWork(locale: string, slug_work: string) {
    return this.instance.get<Resource<WorkResource>>(
      `/public/works/${slug_work}`,
      {
        headers: {
          "Accept-Language": locale
        },
      }
    );
  }

  getCategories(locale: string) {
    return this.instance.get<ResourceCollection<CategoryResource>>(
      "/public/categories",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }

  getEmployees(locale: string) {
    return this.instance.get<ResourceCollection<EmployeeResource>>(
      "/public/employees",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }

  sendEmailContactApi(data: { name: string, email: string, phone: string, company_name: string, discuss: string }, locale: string) {
    return this.instance.post("/public/mails/send-contact", data, {
      headers: {
        "Accept-Language": locale
      }
    });
  }

  sendEmailCVApi(data: FormData, locale: string) {
    return this.instance.post("/public/mails/send-cv", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept-Language": locale
      },
    });
  }

  getTags(locale: string) {
    return this.instance.get<ResourceCollection<TagResource>>(
      "/public/tags",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
  
  getNewsList(locale: string, query: string, page: number = 1) {
    return this.instance.get<ResourceCollectionWithPagination<NewsResource>>(
      "/public/posts",
      {
        headers: {
          "Accept-Language": locale
        },
        params: {
          keywords: query,
          page: page
        }
      }
    );
  }
  
  getNews(locale: string, slug: string) {
    return this.instance.get<Resource<NewsResource>>(
      `/public/posts/${slug}`,
      {
        headers: {
          "Accept-Language": locale
        },
      }
    );
  }
  
  getFlatforms(locale: string) {
    return this.instance.get<ResourceCollection<FlatformResource>>(
      "/public/platforms",
      {
        headers: {
          "Accept-Language": locale
        },
      }
    );
  }
}

export { Api };
