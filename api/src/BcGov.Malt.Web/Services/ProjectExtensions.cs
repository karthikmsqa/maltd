﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using BcGov.Malt.Web.Models.Authorization;
using BcGov.Malt.Web.Models.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BcGov.Malt.Web.Services
{
    public static class ProjectExtensions
    {
        private static readonly TimeSpan DefaultTimeoutTimeout = TimeSpan.FromSeconds(30);

        /// <summary>
        /// Configures access to OData services and projects based on configuration.
        /// </summary>
        /// <param name="services">The services.</param>
        /// <param name="configuration">The configuration.</param>
        /// <param name="logger">The logger to write logs to.</param>
        public static void ConfigureProjectResources(this IServiceCollection services, IConfiguration configuration, Serilog.ILogger logger)
        {
            // read the configuration and register the types for each 
            List<ProjectConfiguration> projects = configuration.GetProjectConfigurations(logger)
                .OrderBy(_ => _.Name)
                .ToList();

            // Register the single instance of the ProjectConfigurationCollection for access by other services
            services.AddSingleton(typeof(ProjectConfigurationCollection), new ProjectConfigurationCollection(projects));

            foreach (ProjectConfiguration project in projects)
            {
                // process each resource in this project
                foreach (ProjectResource projectResource in project.Resources)
                {
                    switch (projectResource.Type)
                    {
                        case ProjectType.Dynamics:
                            ConfigureDynamics(services, project, projectResource, logger);
                            break;

                        case ProjectType.SharePoint:
                            // not configured here due to how saml auth works and is implemented
                            break;
                    }
                }
            }
        }

        private static void ConfigureDynamics(IServiceCollection services, ProjectConfiguration project, ProjectResource projectResource, Serilog.ILogger logger)
        {
            Debug.Assert(services != null, "Required ServiceCollection is null");
            Debug.Assert(project != null, "Required ProjectConfiguration is null");
            Debug.Assert(projectResource != null, "Required ProjectResource is null");
            Debug.Assert(projectResource.Type == ProjectType.Dynamics, "Project type must be Dynamics");

            // the projectResourceKey convention is repeated also in OAuthClientFactory which gets the HttpClient using the same convention,
            //
            // {Id}-dynamics-authorization
            //
            string projectResourceKey = project.Id + "-dynamics";

            // add authorization HttpClient 
            services.AddHttpClient(projectResourceKey + "-authorization", configure =>
                {
                    configure.BaseAddress = projectResource.AuthorizationUri;
                    configure.Timeout = DefaultTimeoutTimeout;
                })
                ;

            // add odata HttpClient 
            // note: I do not like this IoC anti-pattern where we are using the service locator directly, however,
            //       there are many named dependencies. There may be an opportunity to address this in the future
            
            services.AddHttpClient(projectResourceKey, configure =>
                {
                    configure.BaseAddress = projectResource.BaseAddress;
                    configure.Timeout = DefaultTimeoutTimeout;

                    // use the API Gateway if required
                    if (projectResource.BaseAddress.Host != projectResource.Resource.Host)
                    {
                        configure.DefaultRequestHeaders.Add("RouteToHost", projectResource.Resource.Host);
                    }
                })
                .AddHttpMessageHandler(serviceProvider =>
                {
                    // build the token service that talk to the OAuth endpoint 
                    IOAuthClientFactory oauthClientFactory = serviceProvider.GetRequiredService<IOAuthClientFactory>();
                    IOAuthClient client = oauthClientFactory.Create(project);
                    ITokenCache<OAuthOptions, Token> tokenCache = serviceProvider.GetRequiredService<ITokenCache<OAuthOptions, Token>>();

                    ITokenService tokenService = new OAuthTokenService(client, tokenCache);
                    var handler = new TokenAuthorizationHandler(tokenService, CreateOAuthOptions(projectResource));
                    return handler;
                });

        }
        
        private static OAuthOptions CreateOAuthOptions(ProjectResource projectResource)
        {
            Debug.Assert(projectResource != null, "Required ProjectResource is null");

            var options = new OAuthOptions
            {
                AuthorizationUri = projectResource.AuthorizationUri,
                Resource = projectResource.Resource,
                Username = projectResource.Username,
                Password = projectResource.Password,
                ClientId = projectResource.ClientId,
                ClientSecret = projectResource.ClientSecret
            };

            return options;
        }
    }
}
