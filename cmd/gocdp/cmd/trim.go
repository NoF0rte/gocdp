package cmd

import (
	"bufio"
	"os"

	"github.com/NoF0rte/gocdp"
	"github.com/spf13/cobra"
)

// trimCmd represents the trim command
var trimCmd = &cobra.Command{
	Use:   "trim files...",
	Args:  cobra.MinimumNArgs(1),
	Short: "Trim/filter results",
	RunE: func(cmd *cobra.Command, args []string) error {
		truncate, _ := cmd.Flags().GetInt("truncate")
		filterMax, _ := cmd.Flags().GetInt("count")
		redirects, _ := cmd.Flags().GetStringSlice("redirect")
		urls, _ := cmd.Flags().GetStringSlice("url")
		contentTypes, _ := cmd.Flags().GetStringSlice("content-type")
		statusCodes, _ := cmd.Flags().GetIntSlice("status")
		lengths, _ := cmd.Flags().GetIntSlice("length")
		operator, _ := cmd.Flags().GetString("operator")

		var files []string
		for _, arg := range args {
			if arg == "-" {
				scanner := bufio.NewScanner(os.Stdin)
				for scanner.Scan() {
					files = append(files, scanner.Text())
				}
			} else {
				files = append(files, arg)
			}
		}

		var opts []gocdp.TrimOption
		op := gocdp.OrOperator
		if operator == "and" {
			op = gocdp.AndOperator
		}

		opts = append(opts, gocdp.WithFilterOperator(op))
		if truncate > 0 {
			opts = append(opts, gocdp.WithTruncate(truncate))
		}

		if filterMax > 0 {
			opts = append(opts, gocdp.WithFilterMaxResults(filterMax))
		}

		if len(redirects) > 0 {
			opts = append(opts, gocdp.WithFilterRedirect(redirects...))
		}

		if len(urls) > 0 {
			opts = append(opts, gocdp.WithFilterURL(urls...))
		}

		if len(contentTypes) > 0 {
			opts = append(opts, gocdp.WithFilterContentType(contentTypes...))
		}

		if len(statusCodes) > 0 {
			opts = append(opts, gocdp.WithFilterStatus(statusCodes...))
		}

		if len(lengths) > 0 {
			opts = append(opts, gocdp.WithFilterLength(lengths...))
		}

		return gocdp.SmartTrimFiles(files, opts)
	},
}

func init() {
	rootCmd.AddCommand(trimCmd)

	trimCmd.Flags().IntP("truncate", "t", 0, "Maximum number of results per status code to keep. Excess will be trimmed")
	trimCmd.Flags().IntP("count", "n", 0, "Filter by number of results per status code. Matches greater than or equal to")
	trimCmd.Flags().StringSliceP("redirect", "r", []string{}, "Filter redirect URLs by regex")
	trimCmd.Flags().StringSliceP("url", "u", []string{}, "Filter URLs by regex")
	trimCmd.Flags().StringSliceP("content-type", "c", []string{}, "Filter content types")
	trimCmd.Flags().IntSliceP("status", "s", []int{}, "Filter status codes")
	trimCmd.Flags().IntSliceP("length", "l", []int{}, "Filter content lengths")
	trimCmd.Flags().StringP("operator", "o", "or", "The filter operator. Either of: and, or")
}
