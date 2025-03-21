using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SurveyApp.Application.Ports;
using SurveyApp.Domain.Entities;
using SurveyApp.Infrastructure.Data;

namespace SurveyApp.Infrastructure.Repositories
{
    public class SurveyResponseRepository : ISurveyResponseRepository
    {
        private readonly AppDbContext _dbContext;

        public SurveyResponseRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<SurveyResponse> GetByIdAsync(Guid id)
        {
            return await _dbContext.SurveyResponses
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<List<SurveyResponse>> GetBySurveyIdAsync(Guid surveyId)
        {
            return await _dbContext.SurveyResponses
                .Where(r => r.SurveyId == surveyId)
                .ToListAsync();
        }

        public async Task<SurveyResponse> CreateAsync(SurveyResponse response)
        {
            ValidateResponses(response);
            
            await _dbContext.SurveyResponses.AddAsync(response);
            await _dbContext.SaveChangesAsync();
            return response;
        }

        public async Task<int> GetResponseCountForSurveyAsync(Guid surveyId)
        {
            return await _dbContext.SurveyResponses
                .CountAsync(r => r.SurveyId == surveyId);
        }

        public async Task<Dictionary<string, int>> GetQuestionResponseStatisticsAsync(Guid surveyId, Guid questionId)
        {
            var results = new Dictionary<string, int>();
            
            var responses = await _dbContext.SurveyResponses
                .Where(r => r.SurveyId == surveyId)
                .ToListAsync();

            foreach (var response in responses)
            {
                var questionResponses = response.Answers.Where(a => a.QuestionId == questionId).ToList();
                
                foreach (var qResponse in questionResponses)
                {
                    if (!string.IsNullOrEmpty(qResponse.Answer))
                    {
                        if (results.ContainsKey(qResponse.Answer))
                            results[qResponse.Answer]++;
                        else
                            results[qResponse.Answer] = 1;
                    }

                    if (qResponse.MultipleAnswers != null && qResponse.MultipleAnswers.Any())
                    {
                        foreach (var answer in qResponse.MultipleAnswers)
                        {
                            if (results.ContainsKey(answer))
                                results[answer]++;
                            else
                                results[answer] = 1;
                        }
                    }
                }
            }

            return results;
        }
        
        public async Task<List<SurveyResponse>> GetRecentResponsesAsync(int count)
        {
            return await _dbContext.SurveyResponses
                .OrderByDescending(r => r.SubmittedAt)
                .Take(count)
                .ToListAsync();
        }
        
        public async Task<Dictionary<string, double>> GetCompletionRateByQuestionTypeAsync(Guid surveyId)
        {
            var results = new Dictionary<string, double>();
            
            var responses = await _dbContext.SurveyResponses
                .Where(r => r.SurveyId == surveyId)
                .ToListAsync();
                
            var questionTypes = responses
                .SelectMany(r => r.Answers)
                .Select(a => a.QuestionType)
                .Distinct()
                .ToList();
                
            foreach (var type in questionTypes)
            {
                var totalAnswers = responses.SelectMany(r => r.Answers).Count(a => a.QuestionType == type);
                var completedAnswers = responses.SelectMany(r => r.Answers).Count(a => a.QuestionType == type && !string.IsNullOrEmpty(a.Answer));
                
                if (totalAnswers > 0)
                {
                    results[type] = (double)completedAnswers / totalAnswers * 100;
                }
                else
                {
                    results[type] = 0;
                }
            }
            
            return results;
        }
        
        public async Task<Dictionary<string, double>> GetAverageScoreByCategoryAsync(Guid surveyId)
        {
            var results = new Dictionary<string, double>();
            
            var responses = await _dbContext.SurveyResponses
                .Where(r => r.SurveyId == surveyId)
                .ToListAsync();
                
            var categories = responses
                .SelectMany(r => r.Answers)
                .Where(a => !string.IsNullOrEmpty(a.Category))
                .Select(a => a.Category)
                .Distinct()
                .ToList();
                
            foreach (var category in categories)
            {
                var ratingAnswers = responses
                    .SelectMany(r => r.Answers)
                    .Where(a => a.Category == category && 
                               (a.QuestionType == "rating" || a.QuestionType == "nps") && 
                               !string.IsNullOrEmpty(a.Answer) && 
                               double.TryParse(a.Answer, out _))
                    .ToList();
                    
                if (ratingAnswers.Any())
                {
                    double totalScore = ratingAnswers.Sum(a => double.Parse(a.Answer));
                    results[category] = totalScore / ratingAnswers.Count;
                }
                else
                {
                    results[category] = 0;
                }
            }
            
            return results;
        }
        
        public async Task<Dictionary<string, int>> GetQuestionTypeDistributionAsync(Guid surveyId)
        {
            var results = new Dictionary<string, int>();
            
            var responses = await _dbContext.SurveyResponses
                .Where(r => r.SurveyId == surveyId)
                .ToListAsync();
                
            var distribution = responses
                .SelectMany(r => r.Answers)
                .GroupBy(a => a.QuestionType)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return distribution;
        }
        
        public async Task<Dictionary<int, int>> GetNPSDistributionAsync(Guid surveyId)
        {
            var results = new Dictionary<int, int>();
            
            for (int i = 0; i <= 10; i++)
            {
                results[i] = 0;
            }
            
            var responses = await _dbContext.SurveyResponses
                .Where(r => r.SurveyId == surveyId)
                .ToListAsync();
                
            var npsAnswers = responses
                .SelectMany(r => r.Answers)
                .Where(a => a.QuestionType == "nps" && !string.IsNullOrEmpty(a.Answer) && int.TryParse(a.Answer, out _))
                .ToList();
                
            foreach (var answer in npsAnswers)
            {
                int score = int.Parse(answer.Answer);
                if (score >= 0 && score <= 10)
                {
                    results[score]++;
                }
            }
            
            return results;
        }
        
        public async Task<Dictionary<int, int>> GetRatingDistributionAsync(Guid surveyId)
        {
            var results = new Dictionary<int, int>();
            
            for (int i = 1; i <= 5; i++)
            {
                results[i] = 0;
            }
            
            var responses = await _dbContext.SurveyResponses
                .Where(r => r.SurveyId == surveyId)
                .ToListAsync();
                
            var ratingAnswers = responses
                .SelectMany(r => r.Answers)
                .Where(a => a.QuestionType == "rating" && !string.IsNullOrEmpty(a.Answer) && int.TryParse(a.Answer, out _))
                .ToList();
                
            foreach (var answer in ratingAnswers)
            {
                int score = int.Parse(answer.Answer);
                if (score >= 1 && score <= 5)
                {
                    results[score]++;
                }
            }
            
            return results;
        }
        
        public async Task<Dictionary<string, int>> GetDeviceDistributionAsync()
        {
            var results = new Dictionary<string, int>();
            
            var responses = await _dbContext.SurveyResponses.ToListAsync();
            
            var deviceDistribution = responses
                .GroupBy(r => string.IsNullOrEmpty(r.DeviceType) ? "Unknown" : r.DeviceType)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return deviceDistribution;
        }
        
        public async Task<List<SurveyResponse>> GetResponsesWithFullDataAsync(Guid? surveyId = null)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId.HasValue)
            {
                query = query.Where(r => r.SurveyId == surveyId.Value);
            }
            
            var responses = await query
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();
                
            return responses;
        }
        
        public async Task<Dictionary<string, int>> GetBrowserDistributionAsync(Guid? surveyId = null)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId.HasValue)
            {
                query = query.Where(r => r.SurveyId == surveyId.Value);
            }
            
            var responses = await query.ToListAsync();
            
            var distribution = responses
                .GroupBy(r => string.IsNullOrEmpty(r.Browser) ? "Unknown" : r.Browser)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return distribution;
        }
        
        public async Task<Dictionary<string, int>> GetOperatingSystemDistributionAsync(Guid? surveyId = null)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId.HasValue)
            {
                query = query.Where(r => r.SurveyId == surveyId.Value);
            }
            
            var responses = await query.ToListAsync();
            
            var distribution = responses
                .GroupBy(r => string.IsNullOrEmpty(r.OperatingSystem) ? "Unknown" : r.OperatingSystem)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return distribution;
        }
        
        public async Task<Dictionary<string, int>> GetLocationDistributionAsync(Guid? surveyId = null)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId.HasValue)
            {
                query = query.Where(r => r.SurveyId == surveyId.Value);
            }
            
            var responses = await query.ToListAsync();
            
            var distribution = responses
                .GroupBy(r => string.IsNullOrEmpty(r.Location) ? "Unknown" : r.Location)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return distribution;
        }
        
        public async Task<Dictionary<DateTime, int>> GetResponsesOverTimeAsync(Guid surveyId, DateTime startDate, DateTime endDate)
        {
            var results = new Dictionary<DateTime, int>();
            
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                results[date] = 0;
            }
            
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId != Guid.Empty)
            {
                query = query.Where(r => r.SurveyId == surveyId);
            }
            
            var responses = await query
                .Where(r => r.SubmittedAt >= startDate && r.SubmittedAt <= endDate)
                .ToListAsync();
                
            foreach (var response in responses)
            {
                var responseDate = response.SubmittedAt.Date;
                if (results.ContainsKey(responseDate))
                {
                    results[responseDate]++;
                }
            }
            
            return results;
        }
        
        public async Task<double> GetAverageCompletionTimeAsync(Guid surveyId)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId != Guid.Empty)
            {
                query = query.Where(r => r.SurveyId == surveyId);
            }
            
            var responses = await query.ToListAsync();
            
            if (!responses.Any())
            {
                return 0;
            }
            
            return responses.Average(r => r.CompletionTime);
        }
        
        public async Task<Dictionary<string, double>> GetAverageTimePerQuestionTypeAsync(Guid surveyId)
        {
            var results = new Dictionary<string, double>();
            
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId != Guid.Empty)
            {
                query = query.Where(r => r.SurveyId == surveyId);
            }
            
            var responses = await query.ToListAsync();
            
            var questionTypeGroups = responses
                .SelectMany(r => r.Answers)
                .GroupBy(a => a.QuestionType);
                
            foreach (var group in questionTypeGroups)
            {
                if (group.Any(a => a.CompletionTimeSeconds > 0))
                {
                    results[group.Key] = group.Where(a => a.CompletionTimeSeconds > 0)
                                              .Average(a => a.CompletionTimeSeconds);
                }
                else
                {
                    results[group.Key] = 0;
                }
            }
            
            return results;
        }
        
        public async Task<int> GetAbandonmentCountAsync(Guid surveyId)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId != Guid.Empty)
            {
                query = query.Where(r => r.SurveyId == surveyId);
            }
            
            return await query.CountAsync(r => r.WasAbandoned);
        }
        
        public async Task<double> GetAbandonmentRateAsync(Guid surveyId)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId != Guid.Empty)
            {
                query = query.Where(r => r.SurveyId == surveyId);
            }
            
            var totalResponses = await query.CountAsync();
            var abandonedResponses = await query.CountAsync(r => r.WasAbandoned);
            
            if (totalResponses == 0)
            {
                return 0;
            }
            
            return (double)abandonedResponses / totalResponses * 100;
        }
        
        public async Task<Dictionary<int, int>> GetPageViewsDistributionAsync(Guid surveyId)
        {
            var results = new Dictionary<int, int>();
            
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId != Guid.Empty)
            {
                query = query.Where(r => r.SurveyId == surveyId);
            }
            
            var responses = await query.ToListAsync();
            
            var pageViewGroups = responses
                .GroupBy(r => r.PageViews)
                .OrderBy(g => g.Key);
                
            foreach (var group in pageViewGroups)
            {
                results[group.Key] = group.Count();
            }
            
            return results;
        }
        
        public async Task<Dictionary<string, int>> GetSourceDistributionAsync(Guid? surveyId = null)
        {
            var query = _dbContext.SurveyResponses.AsQueryable();
            
            if (surveyId.HasValue)
            {
                query = query.Where(r => r.SurveyId == surveyId.Value);
            }
            
            var responses = await query.ToListAsync();
            
            var distribution = responses
                .GroupBy(r => string.IsNullOrEmpty(r.Source) ? "Direct" : r.Source)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return distribution;
        }
        
        private void ValidateResponses(SurveyResponse response)
        {
            foreach (var answer in response.Answers)
            {
                bool isValid = true;
                
                switch (answer.QuestionType)
                {
                    case "text":
                    case "textarea":
                        isValid = !string.IsNullOrWhiteSpace(answer.Answer);
                        break;
                        
                    case "email":
                        isValid = !string.IsNullOrWhiteSpace(answer.Answer) && 
                                  answer.Answer.Contains("@") && 
                                  answer.Answer.Contains(".");
                        break;
                        
                    case "number":
                        isValid = !string.IsNullOrWhiteSpace(answer.Answer) && 
                                  double.TryParse(answer.Answer, out _);
                        break;
                        
                    case "single-choice":
                    case "dropdown":
                        isValid = !string.IsNullOrWhiteSpace(answer.Answer);
                        break;
                        
                    case "multiple-choice":
                        isValid = answer.MultipleAnswers != null && answer.MultipleAnswers.Any();
                        break;
                        
                    case "rating":
                    case "nps":
                        isValid = !string.IsNullOrWhiteSpace(answer.Answer) && 
                                  int.TryParse(answer.Answer, out int rating) &&
                                  rating >= 0 && rating <= 10;
                        break;
                }
                
                answer.SetValidationStatus(isValid);
            }
        }
        
        public async Task<int> GetTotalResponseCountAsync()
        {
            return await _dbContext.SurveyResponses.CountAsync();
        }
    }
}
